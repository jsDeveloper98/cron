const cron = require("node-cron");
const TLSBot = require("./tlsBot");
const config = require("./config");
const logger = require("./logger");

class Scheduler {
  constructor() {
    this.isRunning = false;
    this.cronJob = null;
  }

  start() {
    const cronExpression = `*/${config.bot.checkInterval} * * * *`; // Every X minutes

    logger.info(
      `Starting scheduler with interval: ${config.bot.checkInterval} minutes`
    );

    this.cronJob = cron.schedule(cronExpression, async () => {
      if (this.isRunning) {
        logger.info("Previous bot instance still running, skipping...");
        return;
      }

      this.isRunning = true;
      logger.info("Starting scheduled bot run...");

      try {
        const bot = new TLSBot();
        await bot.start();
      } catch (error) {
        logger.error("Scheduled bot run failed:", error);
      } finally {
        this.isRunning = false;
      }
    });

    logger.info("Scheduler started successfully");
  }

  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      logger.info("Scheduler stopped");
    }
  }

  // Run immediately once
  async runOnce() {
    if (this.isRunning) {
      logger.info("Bot is already running");
      return;
    }

    this.isRunning = true;
    logger.info("Running bot once...");

    try {
      const bot = new TLSBot();
      await bot.start();
    } catch (error) {
      logger.error("One-time bot run failed:", error);
    } finally {
      this.isRunning = false;
    }
  }
}

module.exports = Scheduler;
