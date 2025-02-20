// src/services/email.service.ts
import nodemailer from "nodemailer";
import { config } from "../config/environment";
import { AppError } from "../middlewares/error.middleware";
import {
  ReservationEmailData,
  PaymentConfirmationEmailData,
  ReservationStatusUpdateEmailData,
} from "../types/email.types";
import { NotificationEmailData } from "../types/notification.types"; // Ensure this type is correctly exported from the module
type MessageType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

interface EmailConfig {
  to: string;
  subject: string;
  html: string;
  attachments?: nodemailer.SendMailOptions["attachments"];
}

interface EmailTemplate {
  subject: string;
  html: string;
}

interface PasswordResetEmailData {
  resetToken: string;
  resetUrl: string;
  expiresIn: string;
}

const backgroundColor: Record<MessageType, string> = {
  INFO: "#f3f4f6",
  SUCCESS: "#d1fae5",
  WARNING: "#fef3c7",
  ERROR: "#fee2e2",
};

export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
      pool: true, // Use pooled connections
      maxConnections: 5,
      maxMessages: 100,
      rateLimit: 5, // Limit to 5 emails per second
    });

    // Verify connection configuration
    this.transporter.verify((error) => {
      if (error) {
        console.error("SMTP Connection Error:", error);
      }
    });
  }

  private async sendEmailWithRetry(
    emailConfig: EmailConfig,
    retryCount = 0
  ): Promise<void> {
    try {
      const mailOptions = {
        from: config.email.from,
        ...emailConfig,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      if (retryCount < this.MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
        return this.sendEmailWithRetry(emailConfig, retryCount + 1);
      }

      console.error("Email sending failed after retries:", error);
      throw new AppError("Failed to send email", 500);
    }
  }

  private getFormattedLocation(
    address: string,
    branchInfo?: { name: string; branch_code: string }
  ): string {
    return branchInfo
      ? `${branchInfo.name} (${branchInfo.branch_code}) - ${address}`
      : address;
  }

  private getReservationCreatedTemplate(
    data: ReservationEmailData
  ): EmailTemplate {
    const pickupLocation = this.getFormattedLocation(
      data.pickup_address,
      data.branch_info ?? undefined
    );

    return {
      subject: "Reservation Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Your Reservation is Confirmed!</h1>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #444; margin-bottom: 20px;">Reservation Details</h2>
            <div style="margin-bottom: 15px;">
              <p style="margin: 5px 0;"><strong>Reservation ID:</strong> ${
                data.reservationId
              }</p>
              <p style="margin: 5px 0;"><strong>Item:</strong> ${
                data.listing.title
              }</p>
              <p style="margin: 5px 0;"><strong>Business:</strong> ${
                data.listing.business.company_name
              }</p>
              <p style="margin: 5px 0;"><strong>Pickup Time:</strong> ${data.pickup_time.toLocaleString()}</p>
              <p style="margin: 5px 0;"><strong>Pickup Location:</strong> ${pickupLocation}</p>
            </div>
            ${
              data.branch_info?.operating_hours
                ? `
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                <p><strong>Branch Operating Hours:</strong> ${data.branch_info.operating_hours}</p>
              </div>
            `
                : ""
            }
          </div>
          <div style="text-align: center; margin-top: 20px; color: #666;">
            <p>Need help? Contact our support team</p>
          </div>
        </div>
      `,
    };
  }

  private getPaymentConfirmationTemplate(
    data: PaymentConfirmationEmailData
  ): EmailTemplate {
    const pickupLocation = this.getFormattedLocation(
      data.pickup_address,
      data.branch_info ?? undefined
    );

    return {
      subject: "Payment Confirmation & QR Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Payment Confirmed!</h1>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="margin-bottom: 20px;">
              <p style="margin: 5px 0;"><strong>Reservation ID:</strong> ${data.reservationId}</p>
              <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ${data.amount} ${data.currency}</p>
              <p style="margin: 5px 0;"><strong>Item:</strong> ${data.listing_title}</p>
              <p style="margin: 5px 0;"><strong>Business:</strong> ${data.business_name}</p>
              <p style="margin: 5px 0;"><strong>Pickup Location:</strong> ${pickupLocation}</p>
            </div>
            <div style="text-align: center; margin: 20px 0; padding: 20px; background-color: #fff; border-radius: 4px;">
              <h3 style="color: #444;">Your QR Code</h3>
              <img src="${data.qrCode}" alt="QR Code" style="max-width: 200px; margin: 10px 0;" />
              <p style="font-size: 16px; margin: 10px 0;"><strong>Confirmation Code:</strong> ${data.confirmationCode}</p>
            </div>
            <div style="font-size: 14px; color: #666; margin-top: 20px;">
              <p>Please show this QR code when picking up your order.</p>
            </div>
          </div>
        </div>
      `,
    };
  }

  private getStatusUpdateTemplate(
    data: ReservationStatusUpdateEmailData
  ): EmailTemplate {
    const pickupLocation = this.getFormattedLocation(
      data.pickup_address,
      data.branch_info ?? undefined
    );
    const statusColors: {
      [key in "CONFIRMED" | "CANCELLED" | "COMPLETED"]: string;
    } = {
      CONFIRMED: "#28a745",
      CANCELLED: "#dc3545",
      COMPLETED: "#17a2b8",
    };

    return {
      subject: `Reservation ${data.status}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: ${
            statusColors[data.status as keyof typeof statusColors] || "#333"
          }; text-align: center;">
            Reservation Status Update
          </h1>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="margin-bottom: 20px;">
              <p style="margin: 5px 0;"><strong>Reservation ID:</strong> ${
                data.reservationId
              }</p>
              <p style="margin: 5px 0;"><strong>New Status:</strong> 
                <span style="color: ${
                  statusColors[
                    data.status as "CONFIRMED" | "CANCELLED" | "COMPLETED"
                  ] || "#333"
                }">${data.status}</span>
              </p>
              <p style="margin: 5px 0;"><strong>Item:</strong> ${
                data.listing.title
              }</p>
              <p style="margin: 5px 0;"><strong>Business:</strong> ${
                data.listing.business.company_name
              }</p>
              <p style="margin: 5px 0;"><strong>Pickup Location:</strong> ${pickupLocation}</p>
            </div>
            ${
              data.status === "CANCELLED"
                ? `
              <div style="margin-top: 15px; padding: 15px; background-color: #fff3f3; border-radius: 4px;">
                <p style="margin: 0;"><strong>Cancellation Reason:</strong> ${data.cancellation_reason}</p>
              </div>
            `
                : ""
            }
          </div>
        </div>
      `,
    };
  }

  async sendReservationCreatedEmail(
    to: string,
    data: ReservationEmailData
  ): Promise<void> {
    const template = this.getReservationCreatedTemplate(data);
    await this.sendEmailWithRetry({ to, ...template });
  }

  async sendPaymentConfirmationEmail(
    to: string,
    data: PaymentConfirmationEmailData
  ): Promise<void> {
    const template = this.getPaymentConfirmationTemplate(data);
    await this.sendEmailWithRetry({
      to,
      ...template,
      attachments: [
        {
          filename: "qr-code.png",
          path: data.qrCode,
          cid: "qr-code",
        },
      ],
    });
  }

  async sendReservationStatusUpdateEmail(
    to: string,
    data: ReservationStatusUpdateEmailData
  ): Promise<void> {
    const template = this.getStatusUpdateTemplate(data);
    await this.sendEmailWithRetry({ to, ...template });
  }

  private getPasswordResetTemplate(
    data: PasswordResetEmailData
  ): EmailTemplate {
    return {
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Password Reset Request</h1>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="margin-bottom: 20px;">We received a request to reset your password. Click the button below to reset it:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resetUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="margin: 20px 0; color: #666;">
              This reset link will expire in ${data.expiresIn}.
            </p>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666;">
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              <p>For security reasons, please do not share this email with anyone.</p>
            </div>
          </div>
        </div>
      `,
    };
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;
    const data: PasswordResetEmailData = {
      resetToken,
      resetUrl,
      expiresIn: "1 hour", // This should match your token expiration time
    };

    const template = this.getPasswordResetTemplate(data);
    await this.sendEmailWithRetry({ to, ...template });
  }

  private getNotificationTemplate(data: NotificationEmailData): EmailTemplate {
    const typeColors: Record<MessageType, string> = {
      INFO: "#374151",
      SUCCESS: "#047857",
      WARNING: "#b45309",
      ERROR: "#b91c1c",
    };

    return {
      subject: data.title || "No Subject",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: ${
            backgroundColor[data.type as keyof typeof backgroundColor]
          }; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: ${
              typeColors[data.type as keyof typeof typeColors]
            }; margin-bottom: 20px;">${data.title}</h2>
            
            <div style="margin-bottom: 20px; color: #333;">
              <p style="margin: 0; line-height: 1.6;">${data.message}</p>
            </div>
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
              <p style="margin: 0;">Sent on: ${data.timestamp.toLocaleString()}</p>
            </div>
          </div>
        </div>
      `,
    };
  }

  async sendNotificationEmail(
    to: string,
    data: NotificationEmailData
  ): Promise<void> {
    const template = this.getNotificationTemplate(data);
    await this.sendEmailWithRetry({ to, ...template });
  }
}
