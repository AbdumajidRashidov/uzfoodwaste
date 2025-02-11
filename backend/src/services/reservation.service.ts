// src/services/reservation.service.ts
import { PrismaClient } from "@prisma/client";
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
}

export class ReservationService {
  async createReservation(
    customerId: string,
    data: {
      listing_id: string;
      pickup_time: Date;
    }
  ) {
    // Check if listing exists and is available
    const listing = await prisma.foodListing.findUnique({
      where: { id: data.listing_id },
      include: {
        business: true,
        location: true,
      },
    });

    if (!listing) {
      throw new AppError("Food listing not found", 404);
    }

    if (listing.status !== "AVAILABLE") {
      throw new AppError("Food listing is not available", 400);
    }

    // Validate pickup time
    const pickupTime = new Date(data.pickup_time);
    const now = new Date();

    if (pickupTime < now) {
      throw new AppError("Pickup time cannot be in the past", 400);
    }

    if (pickupTime < listing.pickup_start || pickupTime > listing.pickup_end) {
      throw new AppError(
        "Pickup time must be within the listing's pickup window",
        400
      );
    }

    // Check for existing active reservations
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        customer_id: customerId,
        listing_id: data.listing_id,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    if (existingReservation) {
      throw new AppError(
        "You already have an active reservation for this listing",
        400
      );
    }

    // Create reservation in a transaction
    const reservation = await prisma.$transaction(async (prisma) => {
      // Create the reservation
      const newReservation = await prisma.reservation.create({
        data: {
          customer_id: customerId,
          listing_id: data.listing_id,
          pickup_time: pickupTime,
          status: "PENDING",
        },
        include: {
          listing: {
            include: {
              business: true,
              location: true,
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

      // Update listing quantity
      await prisma.foodListing.update({
        where: { id: data.listing_id },
        data: {
          quantity: {
            decrement: 1,
          },
        },
      });

      return newReservation;
    });

    // Send confirmation email
    await emailService.sendReservationCreatedEmail(
      reservation.customer.user.email,
      {
        reservationId: reservation.id,
        listing: reservation.listing,
        pickup_time: pickupTime,
      }
    );

    return reservation;
  }

  async processPaymentAndGenerateQR(
    reservationId: string,
    paymentData: {
      amount: number;
      currency: string;
      payment_method: string;
    }
  ) {
    // Process payment first
    const { payment, reservation } = await paymentService.processPayment(
      reservationId,
      paymentData
    );

    // Generate QR code after successful payment
    const qrData = await qrCodeService.generateReservationQR(reservationId);

    // Send payment confirmation email
    await emailService.sendPaymentConfirmationEmail(
      reservation.customer.user.email,
      {
        reservationId,
        qrCode: qrData.qr_code,
        confirmationCode: qrData.confirmation_code,
        amount: paymentData.amount,
        currency: paymentData.currency,
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
    // Verify the reservation belongs to the business
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        listing: {
          include: {
            business: true,
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

    if (reservation.listing.business_id !== businessId) {
      throw new AppError("Not authorized to verify this reservation", 403);
    }

    if (reservation.status !== "CONFIRMED") {
      throw new AppError("Only confirmed reservations can be picked up", 400);
    }

    // Verify confirmation code
    if (reservation.confirmation_code !== confirmationCode) {
      throw new AppError("Invalid confirmation code", 400);
    }

    // Update reservation status in transaction
    const updatedReservation = await prisma.$transaction(async (prisma) => {
      // Update reservation status
      const updated = await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          status: "COMPLETED",
          pickup_confirmed_at: new Date(),
        },
        include: {
          listing: {
            include: {
              business: true,
              location: true,
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

      // Update listing status if no more quantity
      if (updated.listing.quantity <= 1) {
        await prisma.foodListing.update({
          where: { id: updated.listing_id },
          data: {
            status: "SOLD",
          },
        });
      }

      return updated;
    });

    // Send pickup confirmation email
    await emailService.sendPickupConfirmationEmail(
      updatedReservation.customer.user.email,
      {
        reservationId,
        listing: updatedReservation.listing,
        pickup_time: updatedReservation.pickup_confirmed_at!,
      }
    );

    return updatedReservation;
  }
  async getReservation(
    reservationId: string,
    actorId: string,
    actorRole: "CUSTOMER" | "BUSINESS"
  ) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        listing: {
          include: {
            business: true,
            location: true,
            categories: {
              include: {
                category: true,
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
          orderBy: {
            created_at: "desc",
          },
        },
        review: true,
      },
    });

    if (!reservation) {
      throw new AppError("Reservation not found", 404);
    }

    // Verify access permissions
    if (actorRole === "CUSTOMER" && reservation.customer_id !== actorId) {
      throw new AppError("Not authorized to view this reservation", 403);
    }
    if (
      actorRole === "BUSINESS" &&
      reservation.listing.business_id !== actorId
    ) {
      throw new AppError("Not authorized to view this reservation", 403);
    }

    // Calculate additional fields
    const isPaid = reservation.payment_transactions.some(
      (pt) => pt.status === "COMPLETED"
    );
    const isPickupTime = new Date() >= reservation.pickup_time;
    const canCancel = ["PENDING", "CONFIRMED"].includes(reservation.status);

    return {
      ...reservation,
      is_paid: isPaid,
      is_pickup_time: isPickupTime,
      can_cancel: canCancel,
      payment_status: isPaid ? "PAID" : "PENDING",
      time_remaining: reservation.pickup_time.getTime() - new Date().getTime(),
      formatted_pickup_time: reservation.pickup_time.toLocaleString(),
      total_amount: reservation.payment_transactions
        .filter((pt) => pt.status === "COMPLETED")
        .reduce((sum, pt) => sum + Number(pt.amount), 0),
    };
  }
  async getReservationStatus(
    reservationId: string,
    userId: string,
    userRole: string
  ) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        listing: {
          include: {
            business: true,
            location: true,
          },
        },
        payment_transactions: {
          where: {
            status: "COMPLETED",
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

    // Check authorization
    if (
      (userRole === "CUSTOMER" && reservation.customer_id !== userId) ||
      (userRole === "BUSINESS" && reservation.listing.business_id !== userId)
    ) {
      throw new AppError("Not authorized to access this reservation", 403);
    }

    return {
      status: reservation.status,
      is_paid: reservation.payment_transactions.length > 0,
      pickup_time: reservation.pickup_time,
      pickup_confirmed_at: reservation.pickup_confirmed_at,
      has_qr_code: !!reservation.confirmation_code,
      listing: {
        title: reservation.listing.title,
        price: reservation.listing.price,
        business_name: reservation.listing.business.company_name,
        location: reservation.listing.location,
      },
      customer: {
        name: `${reservation.customer.first_name} ${reservation.customer.last_name}`,
        phone: reservation.customer.user.phone,
      },
    };
  }

  async updateReservationStatus(
    reservationId: string,
    data: {
      status: "CONFIRMED" | "COMPLETED" | "CANCELLED";
      cancellation_reason?: string;
    },
    actorId: string,
    actorRole: "CUSTOMER" | "BUSINESS"
  ) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        listing: {
          include: {
            business: true,
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

    // Verify actor permissions
    if (actorRole === "CUSTOMER" && reservation.customer_id !== actorId) {
      throw new AppError("Not authorized to update this reservation", 403);
    }
    if (
      actorRole === "BUSINESS" &&
      reservation.listing.business_id !== actorId
    ) {
      throw new AppError("Not authorized to update this reservation", 403);
    }

    // Validate status transition
    const validTransitions: { [key: string]: string[] } = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!validTransitions[reservation.status].includes(data.status)) {
      throw new AppError(
        `Cannot transition from ${reservation.status} to ${data.status}`,
        400
      );
    }

    // Require cancellation reason
    if (data.status === "CANCELLED" && !data.cancellation_reason) {
      throw new AppError("Cancellation reason is required", 400);
    }

    // Update status in transaction
    const updatedReservation = await prisma.$transaction(async (prisma) => {
      const updated = await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          status: data.status,
          cancellation_reason: data.cancellation_reason,
          ...(data.status === "COMPLETED"
            ? { pickup_confirmed_at: new Date() }
            : {}),
        },
        include: {
          listing: {
            include: {
              business: true,
              location: true,
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

      // If cancelled, restore listing quantity
      if (data.status === "CANCELLED") {
        await prisma.foodListing.update({
          where: { id: updated.listing_id },
          data: {
            quantity: {
              increment: 1,
            },
          },
        });
      }

      return updated;
    });

    // Send status update email
    await emailService.sendReservationStatusUpdateEmail(
      updatedReservation.customer.user.email,
      {
        reservationId,
        status: data.status,
        listing: updatedReservation.listing,
        cancellation_reason: data.cancellation_reason,
      }
    );

    return updatedReservation;
  }

  async getBusinessReservations(businessId: string, query: QueryOptions) {
    const where: any = {
      listing: {
        business_id: businessId,
      },
    };

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
          listing: {
            include: {
              location: true,
            },
          },
          payment_transactions: {
            where: {
              status: "COMPLETED",
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
      }),
    ]);

    return {
      data: reservations,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async getCustomerReservations(customerId: string, query: QueryOptions) {
    const where: any = {
      customer_id: customerId,
    };

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
          listing: {
            include: {
              business: true,
              location: true,
            },
          },
          payment_transactions: {
            where: {
              status: "COMPLETED",
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
      }),
    ]);

    return {
      data: reservations,
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
    // Verify access rights
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        listing: {
          include: {
            business: true,
          },
        },
        customer: true,
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

    // Check authorization
    if (
      (userRole === "CUSTOMER" && reservation.customer_id !== userId) ||
      (userRole === "BUSINESS" && reservation.listing.business_id !== userId)
    ) {
      throw new AppError("Not authorized to access this reservation", 403);
    }

    // Check if payment is completed
    if (reservation.payment_transactions.length === 0) {
      throw new AppError(
        "Payment must be completed before accessing QR code",
        400
      );
    }

    // Check if reservation is in valid status
    if (!["CONFIRMED", "COMPLETED"].includes(reservation.status)) {
      throw new AppError(
        "QR code is only available for confirmed reservations",
        400
      );
    }

    // Generate or retrieve QR code
    const qrData = await qrCodeService.generateReservationQR(reservationId);

    // Add additional information for QR display
    return {
      ...qrData,
      reservation_status: reservation.status,
      pickup_time: reservation.pickup_time,
      business_name: reservation.listing.business.company_name,
      listing_title: reservation.listing.title,
      is_expired: new Date() > reservation.pickup_time,
      is_valid: reservation.status === "CONFIRMED",
      formatted_pickup_time: reservation.pickup_time.toLocaleString(),
    };
  }
}
