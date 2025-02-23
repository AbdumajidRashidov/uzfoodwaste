// src/services/reservation.service.ts
import { Customer, PrismaClient } from "@prisma/client";
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

interface ReservationItem {
  listing_id: string;
  quantity: number;
}

// Helper function to format pickup location
function formatPickupLocation(listing: any): string {
  return listing.branch
    ? `${listing.branch.name} (${listing.branch.branch_code}) - ${listing.location.address}`
    : listing.location.address;
}

export class ReservationService {
  async createReservation(
    customerId: string,
    data: {
      items: ReservationItem[];
      pickup_time: Date;
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
              branch: { include: { location: true } },
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
      });

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
          reservation_items: {
            create: data.items.map((item, index) => ({
              listing_id: item.listing_id,
              quantity: item.quantity,
              price: listingDetails[index] ? listingDetails[index].price : 0,
            })),
          },
        },
        include: {
          reservation_items: {
            include: {
              listing: {
                include: {
                  business: true,
                  branch: {
                    include: {
                      location: true,
                    },
                  },
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

      // Update listing quantities
      await Promise.all(
        data.items.map((item) =>
          prisma.foodListing.update({
            where: { id: item.listing_id },
            data: { quantity: { decrement: item.quantity } },
          })
        )
      );

      return reservation;
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

    const qrData = await qrCodeService.generateReservationQR(reservationId);

    // Get all items with their business info
    const items = await prisma.reservationItem.findMany({
      where: { reservation_id: reservationId },
      include: {
        listing: {
          include: {
            business: true,
            branch: {
              include: {
                location: true,
              },
            },
          },
        },
      },
    });

    await emailService.sendPaymentConfirmationEmail(
      reservation.customer.user.email,
      {
        reservationId,
        qrCode: qrData.qr_code,
        confirmationCode: qrData.confirmation_code,
        amount: paymentData.amount,
        currency: paymentData.currency,
        items: items.map((item) => ({
          title: item.listing.title,
          quantity: item.quantity,
          price: item.price,
          business_name: item.listing.business.company_name,
          pickup_address: item.listing.branch.location.address,
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
                branch: {
                  include: {
                    location: true,
                  },
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
    const hasAccess = reservation.reservation_items.some(
      (item) => item.listing.business_id === businessId
    );
    if (!hasAccess) {
      throw new AppError("Not authorized to verify this reservation", 403);
    }

    // Rest of verification logic...
    const updatedReservation = await prisma.$transaction(async (prisma) => {
      const updated = await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          status: "COMPLETED",
          pickup_confirmed_at: new Date(),
        },
        include: {
          reservation_items: {
            include: {
              listing: true,
            },
          },
        },
      });

      // Update sold items status
      await Promise.all(
        updated.reservation_items.map((item) =>
          prisma.foodListing.update({
            where: { id: item.listing_id },
            data: {
              status:
                item.listing.quantity <= item.quantity ? "SOLD" : "AVAILABLE",
            },
          })
        )
      );

      return updated;
    });

    return updatedReservation;
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
                branch: {
                  include: {
                    location: true,
                  },
                },
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

    return {
      status: reservation.status,
      is_paid: reservation.payment_transactions.length > 0,
      pickup_time: reservation.pickup_time,
      pickup_confirmed_at: reservation.pickup_confirmed_at,
      has_qr_code: !!reservation.confirmation_code,
      total_amount: reservation.total_amount,
      items: reservation.reservation_items.map((item) => ({
        title: item.listing.title,
        quantity: item.quantity,
        price: item.price,
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
                  branch: {
                    include: {
                      location: true,
                    },
                  },
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
                branch: {
                  include: {
                    location: true,
                  },
                },
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

    return {
      ...qrData,
      reservation_status: reservation.status,
      pickup_time: reservation.pickup_time,
      items: reservation.reservation_items.map((item) => ({
        title: item.listing.title,
        quantity: item.quantity,
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
                  branch: {
                    include: {
                      location: true,
                    },
                  },
                },
              },
            },
          },
          payment_transactions: {
            where: { status: "COMPLETED" },
          },
        },
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
    }));

    return {
      data: formattedReservations,
      pagination: {
        total,
        page: query.page || 1,
        limit: query.limit || 10,
        total_pages: Math.ceil(total / (query.limit || 10)),
      },
    };
  }

  async getReservation(
    reservationId: string,
    actorId: string,
    actorRole: "CUSTOMER" | "BUSINESS"
  ) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        reservation_items: {
          include: {
            listing: {
              include: {
                business: true,
                branch: {
                  include: {
                    location: true,
                  },
                },
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

    return {
      ...reservation,
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
    };
  }
}
