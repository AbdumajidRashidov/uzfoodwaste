// src/services/qr.service.ts
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import QRCode from "qrcode";
import crypto from "crypto";

const prisma = new PrismaClient();

export class QRCodeService {
  private generateConfirmationCode(reservationId: string): string {
    const timestamp = Date.now().toString();
    const hash = crypto
      .createHash("sha256")
      .update(`${reservationId}-${timestamp}`)
      .digest("hex");
    return hash.substring(0, 8).toUpperCase();
  }

  async generateReservationQR(reservationId: string) {
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
      },
    });

    if (!reservation) {
      throw new AppError("Reservation not found", 404);
    }

    if (reservation.status !== "CONFIRMED") {
      throw new AppError(
        "QR code can only be generated for confirmed reservations",
        400
      );
    }

    if (reservation.payment_transactions.length === 0) {
      throw new AppError(
        "Payment must be completed before generating QR code",
        400
      );
    }

    let confirmationCode = reservation.confirmation_code;
    if (!confirmationCode) {
      confirmationCode = this.generateConfirmationCode(reservationId);
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { confirmation_code: confirmationCode },
      });
    }

    const qrData = {
      reservation_id: reservationId,
      confirmation_code: confirmationCode,
      items: reservation.reservation_items.map((item) => ({
        id: item.id,
        title: item.listing.title,
        business_id: item.listing.business_id,
        quantity: item.quantity,
      })),
      timestamp: Date.now(),
    };

    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
    return { qr_code: qrCode, confirmation_code: confirmationCode };
  }

  async verifyConfirmationCode(reservationId: string, code: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        reservation_items: {
          include: {
            listing: {
              include: { business: true },
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

    if (reservation.confirmation_code !== code) {
      throw new AppError("Invalid confirmation code", 400);
    }

    return reservation;
  }
}
