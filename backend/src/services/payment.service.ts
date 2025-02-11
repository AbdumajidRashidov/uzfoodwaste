// src/services/payment.service.ts
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import crypto from "crypto";

const prisma = new PrismaClient();

export class PaymentService {
  async processPayment(
    reservationId: string,
    data: {
      amount: number;
      currency: string;
      payment_method: string;
    }
  ) {
    // Validate reservation exists and is in PENDING state
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
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
        payment_transactions: true,
      },
    });

    if (!reservation) {
      throw new AppError("Reservation not found", 404);
    }

    if (reservation.status !== "PENDING") {
      throw new AppError(
        "Can only process payment for pending reservations",
        400
      );
    }

    // Check if payment already exists
    if (
      reservation.payment_transactions.some((pt) => pt.status === "COMPLETED")
    ) {
      throw new AppError("Payment already processed for this reservation", 400);
    }

    // Validate payment amount matches listing price
    if (data.amount !== Number(reservation.listing.price)) {
      throw new AppError("Payment amount does not match listing price", 400);
    }

    // Generate unique transaction ID
    const transactionId = crypto.randomBytes(16).toString("hex");

    // Start transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create payment transaction
      const payment = await prisma.paymentTransaction.create({
        data: {
          reservation_id: reservationId,
          amount: data.amount,
          currency: data.currency,
          payment_method: data.payment_method,
          transaction_id: transactionId,
          status: "COMPLETED",
        },
      });

      // Update reservation status to CONFIRMED
      const updatedReservation = await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          status: "CONFIRMED",
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
          payment_transactions: true,
        },
      });

      return { payment, reservation: updatedReservation };
    });

    return result;
  }

  async getPaymentStatus(reservationId: string) {
    const payment = await prisma.paymentTransaction.findFirst({
      where: {
        reservation_id: reservationId,
        status: "COMPLETED",
      },
    });

    return {
      is_paid: !!payment,
      payment: payment,
    };
  }
}
