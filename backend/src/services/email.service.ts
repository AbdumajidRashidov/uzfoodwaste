// src/services/email.service.ts
import nodemailer from "nodemailer";
import { config } from "../config/environment";
import { FoodListing, Business, BusinessLocation } from "@prisma/client";

interface EmailConfig {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  private async sendEmail(emailConfig: EmailConfig) {
    try {
      const mailOptions = {
        from: config.email.from,
        ...emailConfig,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Email sending failed:", error);
      // Don't throw error to prevent disrupting the main flow
    }
  }

  async sendReservationCreatedEmail(
    to: string,
    data: {
      reservationId: string;
      listing: FoodListing & {
        business: Business;
        location: BusinessLocation;
      };
      pickup_time: Date;
    }
  ) {
    const subject = "Reservation Confirmation";
    const html = `
      <h1>Your Reservation is Confirmed!</h1>
      <p>Reservation ID: ${data.reservationId}</p>
      <p>Item: ${data.listing.title}</p>
      <p>Business: ${data.listing.business.company_name}</p>
      <p>Pickup Time: ${data.pickup_time.toLocaleString()}</p>
      <p>Location: ${data.listing.location.address}</p>
      <p>Please complete the payment to receive your QR code for pickup.</p>
    `;

    await this.sendEmail({ to, subject, html });
  }

  async sendPaymentConfirmationEmail(
    to: string,
    data: {
      reservationId: string;
      qrCode: string;
      confirmationCode: string;
      amount: number;
      currency: string;
    }
  ) {
    const subject = "Payment Confirmation & QR Code";
    const html = `
      <h1>Payment Confirmed!</h1>
      <p>Reservation ID: ${data.reservationId}</p>
      <p>Amount Paid: ${data.amount} ${data.currency}</p>
      <p>Your QR Code:</p>
      <img src="${data.qrCode}" alt="QR Code" />
      <p>Confirmation Code: ${data.confirmationCode}</p>
      <p>Please show this QR code or confirmation code during pickup.</p>
    `;

    await this.sendEmail({ to, subject, html });
  }

  async sendPickupConfirmationEmail(
    to: string,
    data: {
      reservationId: string;
      listing: FoodListing & {
        business: Business;
        location: BusinessLocation;
      };
      pickup_time: Date;
    }
  ) {
    const subject = "Pickup Confirmed";
    const html = `
      <h1>Pickup Confirmed!</h1>
      <p>Reservation ID: ${data.reservationId}</p>
      <p>Item: ${data.listing.title}</p>
      <p>Business: ${data.listing.business.company_name}</p>
      <p>Pickup Time: ${data.pickup_time.toLocaleString()}</p>
      <p>Thank you for helping reduce food waste!</p>
    `;

    await this.sendEmail({ to, subject, html });
  }

  async sendReservationStatusUpdateEmail(
    to: string,
    data: {
      reservationId: string;
      status: string;
      listing: FoodListing & {
        business: Business;
        location: BusinessLocation;
      };
      cancellation_reason?: string;
    }
  ) {
    const subject = `Reservation ${data.status}`;
    let html = `
      <h1>Reservation Status Update</h1>
      <p>Reservation ID: ${data.reservationId}</p>
      <p>New Status: ${data.status}</p>
      <p>Item: ${data.listing.title}</p>
      <p>Business: ${data.listing.business.company_name}</p>
    `;

    if (data.status === "CANCELLED") {
      html += `<p>Cancellation Reason: ${data.cancellation_reason}</p>`;
    }

    await this.sendEmail({ to, subject, html });
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;
    const subject = "Password Reset Request";
    const html = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `;

    await this.sendEmail({ to: email, subject, html });
  }
}
