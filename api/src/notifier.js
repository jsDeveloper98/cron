const nodemailer = require("nodemailer");
const axios = require("axios");
const config = require("./config");
const logger = require("./logger");

class Notifier {
  constructor() {
    this.emailTransporter = null;
    this.setupEmailTransporter();
  }

  setupEmailTransporter() {
    // Only setup email if all required fields are provided and not default values
    const requiredFields = [
      config.notifications.smtp.host,
      config.notifications.smtp.user,
      config.notifications.smtp.pass,
      config.notifications.email,
    ];

    const hasDefaultValues =
      config.notifications.smtp.user?.includes("example.com") ||
      config.notifications.email?.includes("example.com") ||
      config.notifications.smtp.pass === "your-app-password";

    if (requiredFields.every((field) => field) && !hasDefaultValues) {
      try {
        this.emailTransporter = nodemailer.createTransport({
          host: config.notifications.smtp.host,
          port: config.notifications.smtp.port,
          secure: config.notifications.smtp.port === 465,
          auth: {
            user: config.notifications.smtp.user,
            pass: config.notifications.smtp.pass,
          },
        });
        logger.info("Email transporter configured successfully");
      } catch (error) {
        logger.error("Failed to setup email transporter:", error);
      }
    } else {
      logger.info(
        "Email notifications disabled - missing or default configuration"
      );
    }
  }

  async sendEmail(subject, message) {
    if (!this.emailTransporter || !config.notifications.email) {
      logger.info("Email notification skipped - not configured");
      return false;
    }

    try {
      await this.emailTransporter.sendMail({
        from: config.notifications.smtp.user,
        to: config.notifications.email,
        subject: `TLS ${config.tls.country.toUpperCase()} Visa Bot: ${subject}`,
        html: `
          <h2>🇩🇪 ${subject}</h2>
          <p>${message}</p>
          <hr>
          <p><strong>📅 Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>🏢 TLS Center:</strong> ${config.tls.location}</p>
          <p><strong>🌍 Destination:</strong> ${config.tls.country.toUpperCase()}</p>
          <p><strong>📋 Visa Type:</strong> ${config.tls.visaType}</p>
          <p><strong>👥 Applicants:</strong> ${config.tls.applicantCount}</p>
          <hr>
          <p><em>This is an automated message from your TLS Visa Bot</em></p>
        `,
      });

      logger.info("Email notification sent successfully");
      return true;
    } catch (error) {
      logger.error("Failed to send email notification:", error);
      logger.info(
        "Tip: Make sure you're using a Gmail App Password, not your regular password"
      );
      return false;
    }
  }

  async sendWebhook(data) {
    if (!config.notifications.webhookUrl) {
      return false;
    }

    try {
      await axios.post(config.notifications.webhookUrl, {
        ...data,
        timestamp: new Date().toISOString(),
        location: config.tls.location,
        country: config.tls.country,
        visaType: config.tls.visaType,
        applicantCount: config.tls.applicantCount,
      });

      logger.info("Webhook notification sent successfully");
      return true;
    } catch (error) {
      logger.error("Failed to send webhook notification:", error);
      return false;
    }
  }

  async notify(type, message, data = {}) {
    const subject =
      type === "success"
        ? `German Visa Appointment Booked! 🎉`
        : type === "available"
        ? `German Visa Appointments Available! 📅`
        : type === "error"
        ? `Bot Error ❌`
        : `Bot Update 📢`;

    // Always log to console
    logger.info(`📢 NOTIFICATION: ${subject} - ${message}`);

    // Send email notification (if configured)
    await this.sendEmail(subject, message);

    // Send webhook notification (if configured)
    await this.sendWebhook({
      type,
      message,
      ...data,
    });
  }
}

module.exports = new Notifier();
