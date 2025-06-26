require("dotenv").config();

module.exports = {
  tls: {
    baseUrl: process.env.TLS_BASE_URL || "https://am.tlscontact.com",
    country: process.env.DESTINATION_COUNTRY || "germany", // Which country's visa
    visaType: process.env.VISA_TYPE || "tourist",
    location: process.env.LOCATION || "yerevan",
    applicantCount: Number.parseInt(process.env.APPLICANT_COUNT) || 1,
  },

  user: {
    email: process.env.EMAIL,
    password: process.env.PASSWORD,
    phone: process.env.PHONE,
    firstName: process.env.FIRST_NAME,
    lastName: process.env.LAST_NAME,
    passportNumber: process.env.PASSPORT_NUMBER,
    nationality: process.env.NATIONALITY,
    dateOfBirth: process.env.DATE_OF_BIRTH,
  },

  notifications: {
    email: process.env.NOTIFICATION_EMAIL,
    smtp: {
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    webhookUrl: process.env.WEBHOOK_URL,
  },

  bot: {
    checkInterval: Number.parseInt(process.env.CHECK_INTERVAL_MINUTES) || 5,
    maxRetries: Number.parseInt(process.env.MAX_RETRIES) || 3,
    headless: process.env.HEADLESS !== "false",
    screenshotOnError: process.env.SCREENSHOT_ON_ERROR !== "false",
  },
};
