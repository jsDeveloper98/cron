const TLSBot = require("./tlsBot");
const logger = require("./logger");

async function testBot() {
  logger.info("Testing TLS Bot...");

  const bot = new TLSBot();

  try {
    await bot.start();
    logger.info("Test completed successfully");
  } catch (error) {
    logger.error("Test failed:", error);
  }
}

testBot();
