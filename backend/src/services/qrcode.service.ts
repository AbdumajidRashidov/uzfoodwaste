// src/services/qrcode.service.ts
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import QRCode from "qrcode";
import crypto from "crypto";

const prisma = new PrismaClient();

export class QRCodeService {
  /**
   * Generates a unique confirmation code for a reservation
   * @param reservationId The ID of the reservation
   * @returns A unique 8-character alphanumeric confirmation code
   */
  private generateConfirmationCode(reservationId: string): string {
    const timestamp = Date.now().toString();
    const hash = crypto
      .createHash("sha256")
      .update(`${reservationId}-${timestamp}-${Math.random()}`)
      .digest("hex");
    return hash.substring(0, 8).toUpperCase();
  }

  /**
   * Generates a QR code for a reservation
   * @param reservationId The ID of the reservation
   * @returns The QR code data URL and confirmation code
   */
  async generateReservationQR(reservationId: string) {
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

    // Check if payment has been completed
    const isPaid = reservation.payment_transactions.length > 0;
    if (!isPaid) {
      throw new AppError(
        "Payment must be completed before generating QR code",
        400
      );
    }

    // Either use existing confirmation code or generate a new one
    let confirmationCode = reservation.confirmation_code;
    if (!confirmationCode) {
      confirmationCode = this.generateConfirmationCode(reservationId);
      await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          confirmation_code: confirmationCode,
          // Update status to CONFIRMED if not already
          status:
            reservation.status === "PENDING" ? "CONFIRMED" : reservation.status,
        },
      });
    }

    // Group items by business for multi-business reservations
    const businessItems = reservation.reservation_items.reduce(
      (acc: any, item) => {
        const businessId = item.listing.business_id;
        if (!acc[businessId]) {
          acc[businessId] = {
            business_name: item.listing.business.company_name,
            business_id: businessId,
            items: [],
            branch_info: item.listing.branch
              ? {
                  name: item.listing.branch.name,
                  branch_code: item.listing.branch.branch_code,
                  branch_id: item.listing.branch.id,
                  operating_hours: item.listing.branch.operating_hours,
                  manager_name: item.listing.branch.manager_name,
                  manager_phone: item.listing.branch.manager_phone,
                }
              : null,
          };
        }

        acc[businessId].items.push({
          id: item.id,
          title: item.listing.title,
          quantity: item.quantity,
          status: item.status,
          pickup_location: item.listing.location.address,
        });

        return acc;
      },
      {}
    );

    // Format QR data to include reservation details
    const qrData = {
      reservation_id: reservationId,
      reservation_number: reservation.reservation_number,
      confirmation_code: confirmationCode,
      pickup_time: reservation.pickup_time,
      status: reservation.status,
      items_by_business: Object.values(businessItems),
      customer: {
        name: `${reservation.customer.first_name} ${reservation.customer.last_name}`,
        phone: reservation.customer.user.phone,
      },
      timestamp: Date.now(),
    };

    // Generate QR code
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: "H",
      margin: 1,
      scale: 8,
    });

    return {
      qr_code: qrCode,
      confirmation_code: confirmationCode,
      reservation_data: qrData,
    };
  }

  /**
   * Validates a confirmation code for a reservation
   * @param reservationId The ID of the reservation
   * @param code The confirmation code to verify
   * @returns The reservation details if verification is successful
   */
  async verifyConfirmationCode(
    reservationId: string,
    code: string,
    businessId: string,
    branchId?: string,
    userRole?: "BUSINESS" | "BRANCH_MANAGER"
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
        payment_transactions: {
          where: { status: "COMPLETED" },
        },
      },
    });

    if (!reservation) {
      throw new AppError("Reservation not found", 404);
    }

    if (reservation.confirmation_code !== code) {
      throw new AppError("Invalid confirmation code", 400);
    }

    // Filter items based on business and optional branch
    let businessItems = reservation.reservation_items.filter(
      (item) => item.listing.business_id === businessId
    );

    // If branch manager role and branchId provided, further filter by branch
    if (userRole === "BRANCH_MANAGER" && branchId) {
      businessItems = businessItems.filter(
        (item) => item.listing.branch_id === branchId
      );

      // If branch manager has no items in this branch, reject
      if (businessItems.length === 0) {
        throw new AppError(
          "No items from your branch in this reservation",
          403
        );
      }
    } else if (businessItems.length === 0) {
      throw new AppError("Not authorized to verify this reservation", 403);
    }

    // Check if reservation has been paid
    if (reservation.payment_transactions.length === 0) {
      throw new AppError("Payment must be completed before pickup", 400);
    }

    // Check if QR code has expired (based on pickup time)
    const now = new Date();
    const pickupTime = reservation.pickup_time || now;
    const twoHoursAfterPickup = new Date(pickupTime);
    twoHoursAfterPickup.setHours(twoHoursAfterPickup.getHours() + 2);

    if (now > twoHoursAfterPickup) {
      throw new AppError(
        "QR code has expired (more than 2 hours after scheduled pickup)",
        400
      );
    }

    // Group by branch for better organization
    const itemsByBranch = businessItems.reduce((acc: any, item) => {
      const branchId = item.listing.branch_id || "no_branch";
      if (!acc[branchId]) {
        acc[branchId] = {
          branch_name: item.listing.branch?.name || "Main Location",
          branch_code: item.listing.branch?.branch_code || "MAIN",
          items: [],
        };
      }

      acc[branchId].items.push({
        id: item.id,
        title: item.listing.title,
        quantity: item.quantity,
        status: item.status,
      });

      return acc;
    }, {});

    return {
      ...reservation,
      business_items: businessItems,
      items_by_branch: Object.values(itemsByBranch),
      is_multi_business: reservation.reservation_items.some(
        (item) => item.listing.business_id !== businessId
      ),
      is_multi_branch: Object.keys(itemsByBranch).length > 1,
      verification_time: now,
    };
  }

  /**
   * Verifies a confirmation code for a reservation by reservation number
   * @param reservationNumber The reservation number
   * @param code The confirmation code to verify
   * @returns The reservation details if verification is successful
   */
  async verifyConfirmationCodeByNumber(
    reservationNumber: string,
    code: string,
    businessId: string,
    branchId?: string,
    userRole?: "BUSINESS" | "BRANCH_MANAGER"
  ) {
    const reservation = await prisma.reservation.findUnique({
      where: { reservation_number: reservationNumber },
    });

    if (!reservation) {
      throw new AppError("Reservation not found", 404);
    }

    return this.verifyConfirmationCode(
      reservation.id,
      code,
      businessId,
      branchId,
      userRole
    );
  }

  /**
   * Refreshes a QR code for a reservation (generates a new confirmation code)
   * @param reservationId The ID of the reservation
   * @returns The new QR code data URL and confirmation code
   */
  async refreshReservationQR(
    reservationId: string,
    userId: string,
    userRole: "CUSTOMER" | "BUSINESS" | "BRANCH_MANAGER",
    branchId?: string
  ) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        reservation_items: {
          include: {
            listing: {
              include: {
                business: true,
                branch: true,
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

    // Check authorization based on role
    let hasAccess = false;

    if (userRole === "CUSTOMER") {
      // Customer can only refresh their own reservations
      hasAccess = reservation.customer_id === userId;
    } else if (userRole === "BUSINESS") {
      // Business can refresh if they have items in the reservation
      hasAccess = reservation.reservation_items.some(
        (item) => item.listing.business_id === userId
      );
    } else if (userRole === "BRANCH_MANAGER" && branchId) {
      // Branch manager can only refresh if they have items in the reservation from their branch
      hasAccess = reservation.reservation_items.some(
        (item) => item.listing.branch_id === branchId
      );
    }

    if (!hasAccess) {
      throw new AppError("Not authorized to refresh this QR code", 403);
    }

    // Check if payment has been completed
    if (reservation.payment_transactions.length === 0) {
      throw new AppError(
        "Payment must be completed before generating QR code",
        400
      );
    }

    // Check if the reservation status allows refresh
    if (
      reservation.status === "CANCELLED" ||
      reservation.status === "COMPLETED"
    ) {
      throw new AppError(
        `Cannot refresh QR code for a ${reservation.status.toLowerCase()} reservation`,
        400
      );
    }

    // Generate a new confirmation code
    const newConfirmationCode = this.generateConfirmationCode(reservationId);
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { confirmation_code: newConfirmationCode },
    });

    // Generate a new QR code
    return this.generateReservationQR(reservationId);
  }
}
