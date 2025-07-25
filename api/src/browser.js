// const puppeteer = require("puppeteer");
const config = require("./config");
const logger = require("./logger");
const path = require("path");
// const puppeteer = require("puppeteer");

// Importing Puppeteer core as default otherwise
// it won't function correctly with "launch()"
// import puppeteer from "puppeteer-core";

class BrowserManager {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async launch() {
    try {
      logger.info("Attempting to launch browser...");

      // Try different browser launch configurations for macOS
      let launchOptions = {
        headless: config.bot.headless ? "new" : false,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
          "--disable-web-security",
          "--disable-features=VizDisplayCompositor",
          "--disable-extensions",
          "--disable-plugins",
          "--disable-images",
          "--disable-javascript", // We'll enable it later if needed
        ],
      };

      // For macOS, try to use system Chrome if available
      if (process.platform === "darwin") {
        const possibleChromePaths = [
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          "/Applications/Chromium.app/Contents/MacOS/Chromium",
          "/usr/bin/google-chrome-stable",
          "/usr/bin/google-chrome",
          "/usr/bin/chromium-browser",
          "/usr/bin/chromium",
        ];

        for (const chromePath of possibleChromePaths) {
          try {
            const fs = require("fs");
            if (fs.existsSync(chromePath)) {
              launchOptions.executablePath = chromePath;
              logger.info(`Using Chrome at: ${chromePath}`);
              break;
            }
          } catch (e) {
            // Continue to next path
          }
        }
      }

      logger.info("Launch options:", JSON.stringify(launchOptions, null, 2));

      console.log("hasavvvvvvvv");

      let chrome = {};
      let puppeteer;

      if (true) {
        puppeteer = require("puppeteer-core");
        chrome = require("@sparticuz/chromium-min");
        const executablePath = await chrome.executablePath(
          "https://github.com/Sparticuz/chromium/releases/download/v133.0.0/chromium-v133.0.0-pack.tar"
        );
        launchOptions = {
          executablePath,
          args: [...chrome.args, "--disable-web-security"],
          defaultViewport: chrome.defaultViewport,
          headless: true,
          ignoreHTTPSErrors: true,
        };
      } else {
        puppeteer = require("puppeteer");
      }

      this.browser = await puppeteer.launch(launchOptions);

      this.page = await this.browser.newPage();

      logger.info(JSON.stringify(this.page));

      logger.info("starting");

      // const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

      // await sleep(2000);
      const { setTimeout } = require("timers/promises");

      await setTimeout(2000);

      // await this.page.waitForNavigation({ timeout: 4000 });

      // this.page.waitForTimeout(2000);
      logger.info("waiting for timeout");

      // Wait for a short time to ensure the browser is ready

      console.log("hasav4772347742");

      // Enable JavaScript if it was disabled
      await this.page.setJavaScriptEnabled(true);

      // Set viewport and user agent
      await this.page.setViewport({ width: 1366, height: 768 });
      await this.page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      // Set extra headers
      await this.page.setExtraHTTPHeaders({
        "Accept-Language": "en-US,en;q=0.9",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      });

      // Test browser by navigating to a simple page
      await this.page.goto("https://www.google.com", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      logger.info("Browser launched and tested successfully");
      return true;
    } catch (error) {
      logger.error("Failed to launch browser:", error);
      logger.error("Error details:", {
        message: error.message,
        stack: error.stack,
        platform: process.platform,
        nodeVersion: process.version,
      });

      // Try alternative launch method
      // return await this.tryAlternativeLaunch();
    }
  }

  async tryAlternativeLaunch() {
    this.browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    this.page = await this.browser.newPage();

    // Enable JavaScript if it was disabled
    await this.page.setJavaScriptEnabled(true);

    // Set viewport and user agent
    await this.page.setViewport({ width: 1366, height: 768 });
    await this.page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Set extra headers
    await this.page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    });

    // Test browser by navigating to a simple page
    await this.page.goto("https://www.google.com", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    logger.info("Browser launched and tested successfully");
  }

  async close() {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
        logger.info("Browser closed successfully");
      }
    } catch (error) {
      logger.error("Error closing browser:", error);
    }
  }

  async takeScreenshot(filename = "error") {
    if (!this.page || !config.bot.screenshotOnError) return;

    try {
      const screenshotPath = path.join(
        __dirname,
        "../screenshots",
        `${filename}-${Date.now()}.png`
      );
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      logger.info(`Screenshot saved: ${screenshotPath}`);
    } catch (error) {
      logger.error("Failed to take screenshot:", error);
    }
  }

  async waitForSelector(selector, timeout = 30000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      logger.error(`Selector not found: ${selector}`);
      return false;
    }
  }

  async clickElement(selector) {
    try {
      await this.page.click(selector);
      await this.page.waitForTimeout(1000);
      return true;
    } catch (error) {
      logger.error(`Failed to click element: ${selector}`, error);
      return false;
    }
  }

  async typeText(selector, text) {
    try {
      await this.page.type(selector, text);
      return true;
    } catch (error) {
      logger.error(`Failed to type text in: ${selector}`, error);
      return false;
    }
  }

  async selectOption(selector, value) {
    try {
      await this.page.select(selector, value);
      return true;
    } catch (error) {
      logger.error(`Failed to select option: ${selector}`, error);
      return false;
    }
  }
}

module.exports = BrowserManager;
