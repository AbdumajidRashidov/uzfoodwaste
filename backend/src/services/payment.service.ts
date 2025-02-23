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

    if (
      reservation.payment_transactions.some((pt) => pt.status === "COMPLETED")
    ) {
      throw new AppError("Payment already processed for this reservation", 400);
    }

    // Calculate total amount from all items
    const totalAmount = reservation.reservation_items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    // Validate payment amount
    if (data.amount !== totalAmount) {
      throw new AppError(
        "Payment amount does not match total reservation price",
        400
      );
    }

    const transactionId = crypto.randomBytes(16).toString("hex");

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

      // Update reservation status
      const updatedReservation = await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          status: "CONFIRMED",
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
    const [payment, reservation] = await Promise.all([
      prisma.paymentTransaction.findFirst({
        where: {
          reservation_id: reservationId,
          status: "COMPLETED",
        },
      }),
      prisma.reservation.findUnique({
        where: { id: reservationId },
        include: {
          reservation_items: {
            select: {
              price: true,
              quantity: true,
            },
          },
        },
      }),
    ]);

    const totalAmount = reservation?.reservation_items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    return {
      is_paid: !!payment,
      payment,
      total_amount: totalAmount,
    };
  }
}
