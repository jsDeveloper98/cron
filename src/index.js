const Scheduler = require("./scheduler");
const logger = require("./logger");
const config = require("./config");
const fs = require("fs");
const path = require("path");

// Create necessary directories
const dirs = ["logs", "screenshots"];
dirs.forEach((dir) => {
  const dirPath = path.join(__dirname, "..", dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Validate configuration
function validateConfig() {
  const required = [
    { key: "user.email", name: "EMAIL" },
    { key: "user.password", name: "PASSWORD" },
    { key: "user.firstName", name: "FIRST_NAME" },
    { key: "user.lastName", name: "LAST_NAME" },
  ];

  const missing = [];
  const defaultValues = [];

  for (const { key, name } of required) {
    const value = key.split(".").reduce((obj, k) => obj?.[k], config);
    if (!value) {
      missing.push(name);
    } else if (
      value.includes("example.com") ||
      value === "your-password" ||
      value === "John" ||
      value === "Doe"
    ) {
      defaultValues.push(name);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  if (defaultValues.length > 0) {
    throw new Error(
      `Please update these environment variables with real values: ${defaultValues.join(
        ", "
      )}`
    );
  }
}

async function main() {
  try {
    logger.info("TLS Germany Visa Booking Bot Starting...");
    logger.info(
      `Configuration: ${config.tls.location} - ${config.tls.visaType}`
    );

    // Validate configuration
    try {
      validateConfig();
    } catch (error) {
      logger.error("Configuration Error:", error.message);
      logger.info("Please check your .env file and update the required values");
      process.exit(1);
    }

    const scheduler = new Scheduler();

    // Handle command line arguments
    // const args = process.argv.slice(2);

    await scheduler.runOnce();

    // if (args.includes("--once")) {
    //   // Run once and exit
    //   await scheduler.runOnce();
    //   process.exit(0);
    // } else {
    //   // Start scheduled runs
    //   scheduler.start();

    //   // Keep the process running
    //   process.on("SIGINT", () => {
    //     logger.info("Received SIGINT, shutting down gracefully...");
    //     scheduler.stop();
    //     process.exit(0);
    //   });

    //   process.on("SIGTERM", () => {
    //     logger.info("Received SIGTERM, shutting down gracefully...");
    //     scheduler.stop();
    //     process.exit(0);
    //   });

    //   logger.info("Bot is running. Press Ctrl+C to stop.");
    // }
  } catch (error) {
    logger.error("Failed to start bot:", error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

export default main;
