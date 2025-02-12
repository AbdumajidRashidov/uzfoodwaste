// Validate Twilio configuration
import { config } from "./environment";

const validateTwilioConfig = () => {
  const { accountSid, authToken, phoneNumber, verifyServiceSid } =
    config.twilio;

  if (!accountSid || !accountSid.startsWith("AC")) {
    console.warn(
      'Warning: Invalid or missing TWILIO_ACCOUNT_SID. Must start with "AC"'
    );
  }

  if (!authToken) {
    console.warn("Warning: Missing TWILIO_AUTH_TOKEN");
  }

  if (!phoneNumber) {
    console.warn("Warning: Missing TWILIO_PHONE_NUMBER");
  }

  if (!verifyServiceSid || !verifyServiceSid.startsWith("VA")) {
    console.warn(
      'Warning: Invalid or missing TWILIO_VERIFY_SERVICE_SID. Must start with "VA"'
    );
  }
};

validateTwilioConfig();
