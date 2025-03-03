// src/services/reservation.service.ts
import { PrismaClient, Reservation, ReservationItem } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import { PaymentService } from "./payment.service";
import { QRCodeService } from "./qrcode.service";
import { EmailService } from "./email.service";

const prisma = new PrismaClient();
const paymentService = new PaymentService();
const qrCodeService = new QRCodeService();
const emailService = new EmailService();

interface QueryOptions {
  page?: number;
  limit?: number;
  status?: string;
  from_date?: Date;
  to_date?: Date;
  branch_id?: string;
}

// Helper function to format pickup location
function formatPickupLocation(listing: any): string {
  return listing.branch
    ? `${listing.branch.name} (${listing.branch.branch_code}) - ${listing.location.address}`
    : listing.location.address;
}

// Helper function to generate reservation number
async function generateReservationNumber(
  businessCode: string
): Promise<string> {
  // Get the current date in YYYYMMDD format
  const today = new Date();
  const datePrefix = `${today.getFullYear()}${String(
    today.getMonth() + 1
  ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

  // Find the latest reservation number for this business on this date
  const latestReservation = await prisma.reservation.findFirst({
    where: {
      reservation_number: {
        startsWith: `${businessCode}-${datePrefix}`,
      },
    },
    orderBy: {
      reservation_number: "desc",
    },
  });

  // Extract the sequence number and increment
  let sequence = 1;
  if (latestReservation && latestReservation.reservation_number) {
    const parts = latestReservation.reservation_number.split("-");
    if (parts.length === 3) {
      sequence = parseInt(parts[2]) + 1;
    }
  }

  // Format with padding (e.g., BIZ-20250302-00001)
  return `${businessCode}-${datePrefix}-${sequence
    .toString()
    .padStart(5, "0")}`;
}

export class ReservationService {
  async createReservation(
    customerId: string,
    data: {
      items: ReservationItem[];
      pickup_time: Date;
      allow_multiple_businesses?: boolean; // New option to allow items from different businesses
    }
  ) {
    return await prisma.$transaction(async (prisma) => {
      // Validate all listings and calculate total
      const listingDetails = await Promise.all(
        data.items.map((item) =>
          prisma.foodListing.findUnique({
            where: { id: item.listing_id },
            include: {
              business: true,
              location: true,
              branch: true,
            },
          })
        )
      );

      // Validate listings are available
      listingDetails.forEach((listing, index) => {
        if (!listing || listing.status !== "AVAILABLE") {
          throw new AppError(
            `Listing ${data.items[index].listing_id} not available`,
            400
          );
        }

        // Validate quantity
        if (listing.quantity < data.items[index].quantity) {
          throw new AppError(
            `Not enough quantity available for ${listing.title}. Available: ${listing.quantity}`,
            400
          );
        }
      });

      // Check if items are from multiple businesses
      const businessIds = listingDetails.map((listing) => listing?.business_id);
      const uniqueBusinessIds = new Set(businessIds);

      // If multiple businesses and not explicitly allowed, throw error
      if (uniqueBusinessIds.size > 1 && !data.allow_multiple_businesses) {
        throw new AppError(
          "Items must be from the same business. Set allow_multiple_businesses to true if you want to proceed.",
          400
        );
      }

      let reservations: Reservation[] = [];

      if (uniqueBusinessIds.size > 1 && data.allow_multiple_businesses) {
        // Create separate reservations for each business
        const itemsByBusiness: Record<
          string,
          {
            items: { item: ReservationItem; listing: any }[];
            businessCode: string;
          }
        > = {};

        // Group items by business
        data.items.forEach((item, index) => {
          const businessId = listingDetails[index]?.business_id;
          if (businessId && !itemsByBusiness[businessId]) {
            itemsByBusiness[businessId] = {
              items: [],
              businessCode:
                listingDetails[index]?.business.company_code || "BIZ",
            };
          }
          itemsByBusiness[businessId ? businessId : ""]?.items.push({
            item,
            listing: listingDetails[index],
          });
        });

        // Create a reservation for each business
        reservations = await Promise.all(
          Object.entries(itemsByBusiness).map(
            async ([businessId, businessData]: [string, any]) => {
              const reservationNumber = await generateReservationNumber(
                businessData.businessCode
              );

              const businessTotal = businessData.items.reduce(
                (sum: number, { item, listing }: any) =>
                  sum + listing.price.toNumber() * item.quantity,
                0
              );

              return prisma.reservation.create({
                data: {
                  customer_id: customerId,
                  pickup_time: data.pickup_time,
                  total_amount: businessTotal,
                  status: "PENDING",
                  reservation_number: reservationNumber,
                  reservation_items: {
                    create: businessData.items.map(
                      ({
                        item,
                        listing,
                      }: {
                        item: ReservationItem;
                        listing: any;
                      }) => ({
                        listing_id: item.listing_id,
                        quantity: item.quantity,
                        price: listing.price,
                        status: "PENDING",
                      })
                    ),
                  },
                },
                include: {
                  reservation_items: {
                    include: {
                      listing: {
                        include: {
                          business: true,
                          location: true,
                          branch: true,
                        },
                      },
                    },
                  },
                  customer: {
                    include: {
                      user: true,
                    },
                  },
                },
              });
            }
          )
        );

        // Update listing quantities for all items
        await Promise.all(
          data.items.map((item) =>
            prisma.foodListing.update({
              where: { id: item.listing_id },
              data: { quantity: { decrement: item.quantity } },
            })
          )
        );
      } else {
        // Single business - create one reservation
        const businessId = listingDetails[0]?.business_id;
        const business = await prisma.business.findUnique({
          where: { id: businessId },
          select: { company_code: true },
        });

        const businessCode = business?.company_code || "BIZ";
        const reservationNumber = await generateReservationNumber(businessCode);

        // Calculate total amount
        const totalAmount = listingDetails.reduce(
          (sum, listing, index) =>
            listing
              ? sum + listing.price.toNumber() * data.items[index].quantity
              : sum,
          0
        );

        // Create reservation
        const reservation = await prisma.reservation.create({
          data: {
            customer_id: customerId,
            pickup_time: data.pickup_time,
            total_amount: totalAmount,
            status: "PENDING",
            reservation_number: reservationNumber,
            reservation_items: {
              create: data.items.map((item, index) => ({
                listing_id: item.listing_id,
                quantity: item.quantity,
                price: listingDetails[index] ? listingDetails[index].price : 0,
                status: "PENDING",
              })),
            },
          },
          include: {
            reservation_items: {
              include: {
                listing: {
                  include: {
                    business: true,
                    location: true,
                    branch: true,
                  },
                },
              },
            },
            customer: {
              include: {
                user: true,
              },
            },
          },
        });

        reservations = [reservation];

        // Update listing quantities
        await Promise.all(
          data.items.map((item) =>
            prisma.foodListing.update({
              where: { id: item.listing_id },
              data: { quantity: { decrement: item.quantity } },
            })
          )
        );
      }

      // For multiple reservations, we return an array
      // For backward compatibility, if there's just one reservation, return it directly
      return uniqueBusinessIds.size > 1 ? { reservations } : reservations[0];
    });
  }

  async processPaymentAndGenerateQR(
    reservationId: string,
    paymentData: {
      amount: number;
      currency: string;
      payment_method: string;
    }
  ) {
    const { payment, reservation } = await paymentService.processPayment(
      reservationId,
      paymentData
    );

    // Update reservation status to CONFIRMED after successful payment
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "CONFIRMED" },
    });

    const qrData = await qrCodeService.generateReservationQR(reservationId);

    // Get all items with their business info
    const items = await prisma.reservationItem.findMany({
      where: { reservation_id: reservationId },
      include: {
        listing: {
          include: {
            business: true,
            location: true,
            branch: true,
          },
        },
      },
    });

    await emailService.sendPaymentConfirmationEmail(
      reservation.customer.user.email,
      {
        reservationId,
        reservationNumber: reservation.reservation_number,
        qrCode: qrData.qr_code,
        confirmationCode: qrData.confirmation_code,
        amount: paymentData.amount,
        currency: paymentData.currency,
        items: items.map((item) => ({
          title: item.listing.title,
          quantity: item.quantity,
          price: item.price,
          business_name: item.listing.business.company_name,
          pickup_address: item.listing.location.address,
        })),
      }
    );

    return {
      payment,
      reservation,
      qr_code: qrData.qr_code,
      confirmation_code: qrData.confirmation_code,
    };
  }

  async verifyPickup(
    reservationId: string,
    confirmationCode: string,
    businessId: string
  ) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        reservation_items: {
          include: {
            listing: {
              include: {
                business: true,
                location: true,
                branch: true,
              },
            },
          },
        },
        customer: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!reservation) {
      throw new AppError("Reservation not found", 404);
    }

    // Verify business owns at least one item in reservation
    const businessItems = reservation.reservation_items.filter(
      (item) => item.listing.business_id === businessId
    );

    if (businessItems.length === 0) {
      throw new AppError("Not authorized to verify this reservation", 403);
    }

    // Verify the confirmation code
    if (reservation.confirmation_code !== confirmationCode) {
      throw new AppError("Invalid confirmation code", 400);
    }

    return await prisma.$transaction(async (prisma) => {
      // Update only the items from this business
      await Promise.all(
        businessItems.map((item) =>
          prisma.reservationItem.update({
            where: { id: item.id },
            data: { status: "COMPLETED" },
          })
        )
      );

      // Check if all items are now completed
      const pendingItems = await prisma.reservationItem.count({
        where: {
          reservation_id: reservationId,
          status: { not: "COMPLETED" },
        },
      });

      // If all items are completed, update the reservation status
      let updated = reservation;
      if (pendingItems === 0) {
        updated = await prisma.reservation.update({
          where: { id: reservationId },
          data: {
            status: "COMPLETED",
            pickup_confirmed_at: new Date(),
          },
          include: {
            reservation_items: {
              include: {
                listing: {
                  include: {
                    business: true,
                    location: true,
                    branch: true,
                  },
                },
              },
            },
            customer: {
              include: {
                user: {
                  select: {
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        });
      } else {
        // Only update the timestamp if this is the first verification
        if (!reservation.pickup_confirmed_at) {
          await prisma.reservation.update({
            where: { id: reservationId },
            data: {
              pickup_confirmed_at: new Date(),
            },
          });
        }
      }

      // Update sold items status
      await Promise.all(
        businessItems.map((item) =>
          prisma.foodListing.update({
            where: { id: item.listing_id },
            data: {
              status:
                item.listing.quantity <= item.quantity ? "SOLD" : "AVAILABLE",
            },
          })
        )
      );

      return {
        ...updated,
        verified_items: businessItems.length,
        total_items: reservation.reservation_items.length,
        all_items_verified: pendingItems === 0,
      };
    });
  }

  async verifyPickupByNumber(
    reservationNumber: string,
    confirmationCode: string,
    businessId: string
  ) {
    const reservation = await prisma.reservation.findUnique({
      where: { reservation_number: reservationNumber },
      include: {
        reservation_items: {
          include: {
            listing: {
              include: {
                business: true,
                location: true,
                branch: true,
              },
            },
          },
        },
        customer: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!reservation) {
      throw new AppError("Reservation not found", 404);
    }

    // Delegate to the main verification method
    return this.verifyPickup(reservation.id, confirmationCode, businessId);
  }

  async getReservationStatus(
    reservationId: string,
    userId: string,
    userRole: string
  ) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        reservation_items: {
          include: {
            listing: {
              include: {
                business: true,
                location: true,
                branch: true,
              },
            },
          },
        },
        payment_transactions: {
          where: { status: "COMPLETED" },
        },
        customer: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!reservation) {
      throw new AppError("Reservation not found", 404);
    }

    // Check authorization
    const hasAccess =
      userRole === "CUSTOMER"
        ? reservation.customer_id === userId
        : reservation.reservation_items.some(
            (item) => item.listing.business_id === userId
          );

    if (!hasAccess) {
      throw new AppError("Not authorized to access this reservation", 403);
    }

    // Group items by business
    const itemsByBusiness = reservation.reservation_items.reduce(
      (
        acc: {
          [key: string]: {
            business_name: string;
            items: any[];
            all_completed: boolean;
          };
        },
        item
      ) => {
        const businessId = item.listing.business_id;
        if (!acc[businessId]) {
          acc[businessId] = {
            business_name: item.listing.business.company_name,
            items: [],
            all_completed: true,
          };
        }

        acc[businessId].items.push({
          title: item.listing.title,
          quantity: item.quantity,
          price: item.price,
          status: item.status,
          pickup_location: formatPickupLocation(item.listing),
        });

        // Track if all items for this business are completed
        if (item.status !== "COMPLETED") {
          acc[businessId].all_completed = false;
        }

        return acc;
      },
      {}
    );

    return {
      reservation_number: reservation.reservation_number,
      status: reservation.status,
      is_paid: reservation.payment_transactions.length > 0,
      pickup_time: reservation.pickup_time,
      pickup_confirmed_at: reservation.pickup_confirmed_at,
      has_qr_code: !!reservation.confirmation_code,
      total_amount: reservation.total_amount,
      items_by_business: itemsByBusiness,
      all_items: reservation.reservation_items.map((item) => ({
        title: item.listing.title,
        quantity: item.quantity,
        price: item.price,
        status: item.status,
        business_name: item.listing.business.company_name,
        pickup_location: formatPickupLocation(item.listing),
      })),
      customer: {
        name: `${reservation.customer.first_name} ${reservation.customer.last_name}`,
        phone: reservation.customer.user.phone,
      },
    };
  }

  async getCustomerReservations(customerId: string, query: QueryOptions) {
    const where: any = { customer_id: customerId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.from_date || query.to_date) {
      where.pickup_time = {};
      if (query.from_date) where.pickup_time.gte = query.from_date;
      if (query.to_date) where.pickup_time.lte = query.to_date;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [total, reservations] = await Promise.all([
      prisma.reservation.count({ where }),
      prisma.reservation.findMany({
        where,
        include: {
          reservation_items: {
            include: {
              listing: {
                include: {
                  business: true,
                  location: true,
                  branch: true,
                  categories: {
                    include: { category: true },
                  },
                },
              },
            },
          },
          payment_transactions: {
            where: { status: "COMPLETED" },
          },
        },
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
    ]);

    const formattedReservations = reservations.map((reservation) => ({
      ...reservation,
      items: reservation.reservation_items.map((item) => ({
        ...item,
        listing: {
          ...item.listing,
          pickup_location: formatPickupLocation(item.listing),
        },
      })),
      total_amount: reservation.total_amount,
      total_items: reservation.reservation_items.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
      businesses: [
        ...new Set(
          reservation.reservation_items.map(
            (item) => item.listing.business.company_name
          )
        ),
      ],
    }));

    return {
      data: formattedReservations,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async getBusinessReservations(businessId: string, query: QueryOptions) {
    const where: any = {
      reservation_items: {
        some: {
          listing: {
            business_id: businessId,
          },
        },
      },
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.branch_id) {
      where.reservation_items.some.listing.branch_id = query.branch_id;
    }

    if (query.from_date || query.to_date) {
      where.pickup_time = {};
      if (query.from_date) where.pickup_time.gte = query.from_date;
      if (query.to_date) where.pickup_time.lte = query.to_date;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [total, reservations] = await Promise.all([
      prisma.reservation.count({ where }),
      prisma.reservation.findMany({
        where,
        include: {
          customer: {
            include: {
              user: {
                select: {
                  email: true,
                  phone: true,
                },
              },
            },
          },
          reservation_items: {
            include: {
              listing: {
                include: {
                  business: true,
                  location: true,
                  branch: true,
                },
              },
            },
          },
          payment_transactions: {
            where: { status: "COMPLETED" },
          },
        },
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
    ]);

    const formattedReservations = reservations.map((reservation) => ({
      ...reservation,
      business_items: reservation.reservation_items
        .filter((item) => item.listing.business_id === businessId)
        .map((item) => ({
          ...item,
          listing: {
            ...item.listing,
            pickup_location: formatPickupLocation(item.listing),
          },
        })),
      total_items: reservation.reservation_items
        .filter((item) => item.listing.business_id === businessId)
        .reduce((sum, item) => sum + item.quantity, 0),
      total_business_amount: reservation.reservation_items
        .filter((item) => item.listing.business_id === businessId)
        .reduce((sum, item) => sum + item.price.toNumber() * item.quantity, 0),
      is_multi_business: reservation.reservation_items.some(
        (item) => item.listing.business_id !== businessId
      ),
    }));

    return {
      data: formattedReservations,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async getReservationQR(
    reservationId: string,
    userId: string,
    userRole: string
  ) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        reservation_items: {
          include: {
            listing: {
              include: {
                business: true,
                location: true,
                branch: true,
              },
            },
          },
        },
        customer: true,
        payment_transactions: {
          where: { status: "COMPLETED" },
        },
      },
    });

    if (!reservation) {
      throw new AppError("Reservation not found", 404);
    }

    const hasAccess =
      userRole === "CUSTOMER"
        ? reservation.customer_id === userId
        : reservation.reservation_items.some(
            (item) => item.listing.business_id === userId
          );

    if (!hasAccess) {
      throw new AppError("Not authorized to access this reservation", 403);
    }

    if (reservation.payment_transactions.length === 0) {
      throw new AppError(
        "Payment must be completed before accessing QR code",
        400
      );
    }

    const qrData = await qrCodeService.generateReservationQR(reservationId);

    // Group items by business
    interface BusinessItemData {
      business_name: string;
      business_id: string;
      items: any[];
      branch_info: {
        name: string;
        branch_code: string;
        manager_name: string;
        operating_hours: any;
        manager_phone: string;
      } | null;
    }

    // Define BusinessItemsMap with index signature to allow string indexing
    interface BusinessItemsMap {
      [key: string]: BusinessItemData;
    }

    const businessItems = reservation.reservation_items.reduce<{
      [key: string]: BusinessItemData;
    }>((acc: Record<string, BusinessItemData>, item) => {
      const businessId = item.listing.business_id || "";
      if (!acc[businessId]) {
        acc[businessId] = {
          business_name: item.listing.business.company_name,
          business_id: businessId,
          items: [],
          branch_info: item.listing.branch
            ? {
                name: item.listing.branch.name,
                branch_code: item.listing.branch.branch_code,
                operating_hours: item.listing.branch.operating_hours,
                manager_name: item.listing.branch.manager_name,
                manager_phone: item.listing.branch.manager_phone,
              }
            : null,
        };
      }

      acc[businessId].items.push({
        title: item.listing.title,
        quantity: item.quantity,
        status: item.status,
        price: item.price,
      });

      return acc;
    }, {} as { [key: string]: BusinessItemData });

    return {
      ...qrData,
      reservation_number: reservation.reservation_number,
      reservation_status: reservation.status,
      pickup_time: reservation.pickup_time,
      items_by_business: Object.values(businessItems),
      items: reservation.reservation_items.map((item) => ({
        title: item.listing.title,
        quantity: item.quantity,
        status: item.status,
        business_name: item.listing.business.company_name,
        pickup_location: formatPickupLocation(item.listing),
        branch_info: item.listing.branch
          ? {
              name: item.listing.branch.name,
              branch_code: item.listing.branch.branch_code,
              operating_hours: item.listing.branch.operating_hours,
              manager_name: item.listing.branch.manager_name,
              manager_phone: item.listing.branch.manager_phone,
            }
          : null,
      })),
      is_expired: new Date() > (reservation.pickup_time ?? new Date()),
      is_valid: reservation.status === "CONFIRMED",
      formatted_pickup_time:
        reservation.pickup_time?.toLocaleString() ?? "Not scheduled",
      total_amount: reservation.total_amount,
    };
  }

  async getReservation(
    reservationId: string,
    actorId: string,
    actorRole: "CUSTOMER" | "BUSINESS" | "BRANCH_MANAGER"
  ) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        reservation_items: {
          include: {
            listing: {
              include: {
                business: true,
                location: true,
                branch: true,
                categories: {
                  include: { category: true },
                },
              },
            },
          },
        },
        customer: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
                language_preference: true,
              },
            },
          },
        },
        payment_transactions: {
          orderBy: { created_at: "desc" },
        },
        reviews: true,
      },
    });

    if (!reservation) {
      throw new AppError("Reservation not found", 404);
    }

    const hasAccess =
      actorRole === "CUSTOMER"
        ? reservation.customer_id === actorId
        : reservation.reservation_items.some(
            (item) => item.listing.business_id === actorId
          );

    if (!hasAccess) {
      throw new AppError("Not authorized to view this reservation", 403);
    }

    const isPaid = reservation.payment_transactions.some(
      (pt) => pt.status === "COMPLETED"
    );
    const isPickupTime = reservation.pickup_time
      ? new Date() >= reservation.pickup_time
      : false;
    const canCancel = ["PENDING", "CONFIRMED"].includes(reservation.status);

    // Group items by business
    interface BusinessItemData {
      business_name: string;
      business_id: string;
      items: any[];
      branch_info: {
        name: string;
        branch_code: string;
        operating_hours: any;
      } | null;
    }

    interface BusinessItemsMap {
      [businessId: string]: BusinessItemData;
    }

    const businessItems: BusinessItemsMap =
      reservation.reservation_items.reduce<BusinessItemsMap>(
        (acc: BusinessItemsMap, item) => {
          const businessId = item.listing.business_id || "";
          if (!acc[businessId]) {
            acc[businessId] = {
              business_name: item.listing.business.company_name,
              business_id: businessId,
              items: [],
              branch_info: item.listing.branch
                ? {
                    name: item.listing.branch.name,
                    branch_code: item.listing.branch.branch_code,
                    operating_hours: item.listing.branch.operating_hours,
                  }
                : null,
            };
          }

          acc[businessId].items.push({
            id: item.id,
            title: item.listing.title,
            quantity: item.quantity,
            price: item.price,
            status: item.status,
            pickup_location: formatPickupLocation(item.listing),
          });

          return acc;
        },
        {}
      );

    return {
      ...reservation,
      items_by_business: Object.values(businessItems),
      items: reservation.reservation_items.map((item) => ({
        ...item,
        listing: {
          ...item.listing,
          pickup_location: formatPickupLocation(item.listing),
        },
      })),
      is_paid: isPaid,
      is_pickup_time: isPickupTime,
      can_cancel: canCancel,
      payment_status: isPaid ? "PAID" : "PENDING",
      time_remaining:
        (reservation.pickup_time ?? new Date()).getTime() -
        new Date().getTime(),
      formatted_pickup_time:
        reservation.pickup_time?.toLocaleString() ?? "Not scheduled",
      total_amount: reservation.total_amount,
      is_multi_business: Object.keys(businessItems).length > 1,
    };
  }

  async cancelReservation(
    reservationId: string,
    cancelledBy: string,
    cancelReason: string,
    userRole: "CUSTOMER" | "BRANCH_MANAGER" | "BUSINESS"
  ) {
    // Find the reservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        reservation_items: {
          include: {
            listing: {
              include: {
                business: true,
                location: true,
                branch: true,
              },
            },
          },
        },
        customer: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
        },
        payment_transactions: {
          where: {
            status: "COMPLETED",
          },
        },
      },
    });

    if (!reservation) {
      throw new AppError("Reservation not found", 404);
    }

    // Determine which items can be cancelled based on role
    let itemsToCancel = [];

    if (userRole === "CUSTOMER") {
      // Customer can cancel entire reservation if it's PENDING and no payment
      if (reservation.status !== "PENDING") {
        throw new AppError(
          "You can only cancel reservations in PENDING status",
          400
        );
      }

      if (reservation.payment_transactions.length > 0) {
        throw new AppError(
          "Reservation cannot be cancelled after payment",
          400
        );
      }

      // Customer cancels all items
      itemsToCancel = reservation.reservation_items;
    } else {
      // Business/Branch manager can cancel their own items
      // First verify they own some items
      itemsToCancel = reservation.reservation_items.filter(
        (item) => item.listing.business_id === cancelledBy
      );

      if (itemsToCancel.length === 0) {
        throw new AppError(
          "Not authorized to cancel items in this reservation",
          403
        );
      }

      // Business can only cancel if items aren't already cancelled
      if (itemsToCancel.every((item) => item.status === "CANCELLED")) {
        throw new AppError(
          "All your items in this reservation are already cancelled",
          400
        );
      }
    }

    // Perform transaction to update reservation and listings
    const updatedReservation = await prisma.$transaction(async (prisma) => {
      // Update item statuses
      await Promise.all(
        itemsToCancel.map((item) =>
          prisma.reservationItem.update({
            where: { id: item.id },
            data: { status: "CANCELLED" },
          })
        )
      );

      // Restore listing quantities
      await Promise.all(
        itemsToCancel.map((item) =>
          prisma.foodListing.update({
            where: {
              id: item.listing_id,
            },
            data: {
              quantity: {
                increment: item.quantity,
              },
            },
          })
        )
      );

      // Check if all items are now cancelled
      const activeItems = await prisma.reservationItem.count({
        where: {
          reservation_id: reservationId,
          status: { not: "CANCELLED" },
        },
      });

      // If all items cancelled, update the entire reservation status
      if (activeItems === 0) {
        await prisma.reservation.update({
          where: { id: reservationId },
          data: {
            status: "CANCELLED",
            cancellation_reason: cancelReason,
          },
        });
      }

      // Get the updated reservation with all its data
      return prisma.reservation.findUnique({
        where: { id: reservationId },
        include: {
          reservation_items: {
            include: {
              listing: {
                include: {
                  business: true,
                  location: true,
                  branch: true,
                },
              },
            },
          },
          customer: {
            include: {
              user: {
                select: {
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      });
    });

    if (!updatedReservation) {
      throw new AppError("Error updating reservation", 500);
    }

    // Send cancellation email
    await emailService.sendReservationStatusUpdateEmail(
      updatedReservation.customer.user.email,
      {
        reservationId,
        reservationNumber: updatedReservation.reservation_number,
        status:
          itemsToCancel.length === updatedReservation.reservation_items.length
            ? "CANCELLED"
            : "PARTIALLY_CANCELLED",
        items: itemsToCancel.map((item) => ({
          title: item.listing.title,
          quantity: item.quantity,
          business_name: item.listing.business.company_name,
          pickup_address: item.listing.location.address,
          branch_info: {
            name: item.listing.branch?.name ?? "Unknown Branch",
            branch_code: item.listing.branch?.branch_code ?? "NO_CODE",
          },
        })),
        cancellation_reason: cancelReason,
        pickup_time: updatedReservation?.pickup_time ?? new Date(),
        total_amount: itemsToCancel.reduce(
          (sum, item) => sum + item.price.toNumber() * item.quantity,
          0
        ),
      }
    );

    return {
      reservation: updatedReservation,
      cancelled_items: itemsToCancel.length,
      total_items: updatedReservation.reservation_items.length,
      all_items_cancelled:
        itemsToCancel.length === updatedReservation.reservation_items.length,
    };
  }

  async getReservationByNumber(
    reservationNumber: string,
    actorId: string,
    actorRole: "CUSTOMER" | "BUSINESS" | "BRANCH_MANAGER"
  ) {
    const reservation = await prisma.reservation.findUnique({
      where: { reservation_number: reservationNumber },
      include: {
        reservation_items: {
          include: {
            listing: {
              include: {
                business: true,
                location: true,
                branch: true,
                categories: {
                  include: { category: true },
                },
              },
            },
          },
        },
        customer: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
                language_preference: true,
              },
            },
          },
        },
        payment_transactions: {
          orderBy: { created_at: "desc" },
        },
        reviews: true,
      },
    });

    if (!reservation) {
      throw new AppError("Reservation not found", 404);
    }

    // Delegate to the main method
    return this.getReservation(reservation.id, actorId, actorRole);
  }
}
