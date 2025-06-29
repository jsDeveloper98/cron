const BrowserManager = require("./browser");
const config = require("./config");
const logger = require("./logger");
const notifier = require("./notifier");
const moment = require("moment");
const { setTimeout } = require("timers/promises");

class TLSBot {
  constructor() {
    this.browser = new BrowserManager();
    this.isLoggedIn = false;
    this.retryCount = 0;
  }

  async start() {
    try {
      logger.info(
        `Starting TLS Visa Bot for ${config.tls.country.toUpperCase()} visa...`
      );
      logger.info(
        `Target: ${config.tls.country} ${config.tls.visaType} visa in ${config.tls.location}`
      );

      if (!(await this.browser.launch())) {
        throw new Error("Failed to launch browser");
      }

      await this.login();
      // await this.checkAndBookAppointment();
    } catch (error) {
      logger.error("Bot execution failed:", error);
      // await this.browser.takeScreenshot("bot-error");
      await notifier.notify("error", `Bot failed: ${error.message}`);
    } finally {
      await this.browser.close();
    }
  }

  count = 0;

  async tst() {
    try {
      // Check if "no appointments available" text exists - Fixed XPath syntax
      const notAvailableDaysText = await this.browser.page.$$(
        'xpath/.//p[contains(., "We currently don’t have any appointment slots available.")]'
      );

      if (notAvailableDaysText) {
        // Limit to 6 months
        console.log(
          `No appointments found, checking next month... (attempt ${
            this.count + 1
          })`
        );

        // Look for next month button
        const nextMonthButton = await this.browser.page.$(
          '[data-testid="btn-next-month-available"]'
        );

        if (nextMonthButton) {
          await nextMonthButton.click();
          this.count += 1;

          // Wait for page to load
          // await this.browser.page.waitForTimeout(2000);
          await setTimeout(2000);

          // Take screenshot for debugging
          // await this.browser.takeScreenshot(`month-check-${this.count}`);

          // Recursively call this function
          return await this.tst();
        } else {
          logger.info("No more months available to check");
          // await notifier.notify("error", `No appointments available`, {
          //   monthsChecked: this.count,
          //   country: config.tls.country,
          //   visaType: config.tls.visaType,
          // });
          return false;
        }
      } else {
        logger.info("Available appointment slots found!");

        await notifier.notify(
          "success",
          `Available appointment slots found after checking ${this.count} months!`,
          {
            monthsChecked: this.count,
            country: config.tls.country,
            visaType: config.tls.visaType,
          }
        );

        return true;
      }
    } catch (error) {
      console.error("Error in tst function:", error);
      logger.error("Error checking months:", error);
      return false;
    }
  }

  async login() {
    try {
      logger.info("Attempting to login to TLS Armenia...");

      // Use the exact login URL you provided
      const loginUrl = `https://visas-de.tlscontact.com/en-us/country/am/vac/amEVN2de`;

      await this.browser.page.goto(loginUrl, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Wait for page to fully load
      // await this.page.waitForNavigation({ timeout: 2000 });
      await setTimeout(2000);

      // await this.browser.page.waitForTimeout(2000);

      // Take screenshot to see what we're working with
      // await this.browser.takeScreenshot("initial-page-loaded");

      const [loginButton] = await this.browser.page.$$(
        "xpath/.//span[contains(., 'LOGIN')]"
      );

      loginButton.click({ count: 1 });

      // await this.browser.page.waitForTimeout(1000);
      await setTimeout(1000);

      // await this.page.waitForNavigation({ timeout: 1000 });

      // await this.browser.takeScreenshot("login-page-loaded");

      logger.info("Looking for email input field...");

      const emailSelectors = [
        "#email-input-field",
        "input[name='username']",
        "input[type='text'][name='username']",
        ".tls-input[name='username']",
        "#email",
        "input[name='email']",
        "input[type='email']",
      ];

      let emailField = null;
      for (const selector of emailSelectors) {
        try {
          logger.info(`Trying email selector: ${selector}`);
          emailField = await this.browser.page.$(selector);
          if (emailField) {
            logger.info(`✅ Found email field with selector: ${selector}`);
            break;
          }
        } catch (e) {
          logger.warn(`❌ Selector failed: ${selector}`);
        }
      }

      if (!emailField) {
        const pageContent = await this.browser.page.content();
        logger.error("Page HTML content:", pageContent.substring(0, 2000));
        throw new Error("Email input field not found on login page");
      }

      logger.info("Looking for password field...");

      const passwordSelectors = [
        "#password-input-field",
        "input[id='password-input-field']",
        "input[name='password']",
        "input[type='password']",
        ".tls-input[type='password']",
        "#password",
        "input[name='current-password']",
        "input[autocomplete='current-password']",
      ];

      let passwordField = null;
      for (const selector of passwordSelectors) {
        try {
          logger.info(`Trying password selector: ${selector}`);
          passwordField = await this.browser.page.$(selector);
          if (passwordField) {
            logger.info(`✅ Found password field with selector: ${selector}`);
            break;
          }
        } catch (e) {
          logger.warn(`❌ Password selector failed: ${selector}`);
        }
      }

      if (!passwordField) {
        throw new Error("Password input field not found on login page");
      }

      logger.info("Filling email field...");
      await emailField.click({ clickCount: 3 });
      await emailField.type(config.user.email, { delay: 100 });
      // await this.browser.page.waitForTimeout(200);
      await setTimeout(200);

      logger.info("Filling password field...");
      await passwordField.click({ clickCount: 3 });
      await passwordField.type(config.user.password, { delay: 100 });
      // await this.browser.page.waitForTimeout(200);
      await setTimeout(200);

      // await this.browser.takeScreenshot("login-fields-filled");

      logger.info("Looking for submit button...");

      const submitSelectors = [
        "#btn-login",
        'button[type="submit"]',
        'input[type="submit"]',
        ".login-btn",
        ".submit-btn",
        "#login-button",
        "#submit-button",
        'button:contains("Sign in")',
        'button:contains("Login")',
        'button:contains("Log in")',
        'button:contains("Continue")',
        ".tls-button",
        "button.tls-button",
      ];

      let submitButton = null;
      for (const selector of submitSelectors) {
        try {
          logger.info(`Trying submit selector: ${selector}`);
          submitButton = await this.browser.page.$(selector);
          if (submitButton) {
            logger.info(`✅ Found submit button: ${selector}`);
            break;
          }
        } catch (e) {
          logger.warn(`❌ Submit selector failed: ${selector}`);
        }
      }

      if (!submitButton) {
        const allButtons = await this.browser.page.$$("button");
        logger.info(`Found ${allButtons.length} buttons on page`);

        for (let i = 0; i < allButtons.length; i++) {
          const buttonText = await allButtons[i].textContent();
          logger.info(`Button ${i}: "${buttonText}"`);
        }

        if (allButtons.length > 0) {
          submitButton = allButtons[0];
          logger.info("Using first button as submit button");
        } else {
          throw new Error("No submit button found on login page");
        }
      }

      logger.info("Submitting login form...");
      await submitButton.click();

      // await this.browser.page.waitForTimeout(2000);
      await setTimeout(2000);

      // await this.browser.takeScreenshot("after-login-submit");

      const currentUrl = this.browser.page.url();
      logger.info(`After login submission, current URL: ${currentUrl}`);

      const successIndicators = [
        "dashboard",
        "appointment",
        "booking",
        "visas-de.tlscontact.com",
        "profile",
        "account",
      ];

      const isLoginSuccessful = successIndicators.some((indicator) =>
        currentUrl.toLowerCase().includes(indicator.toLowerCase())
      );

      if (isLoginSuccessful) {
        this.isLoggedIn = true;
        logger.info("✅ Login successful!");

        // const selector = "button[type='submit']";
        // const selectApplicationButton = await this.browser.page.$(selector);

        // if (!selectApplicationButton) {
        //   logger.error("Select Application button not found");
        //   return [];
        // }

        // console.log({ selectApplicationButton });

        // // Fix: Use evaluate to click the button
        // await this.browser.page.evaluate((sel) => {
        //   const button = document.querySelector(sel);
        //   if (button) {
        //     button.click();
        //   }
        // }, selector);

        // console.log("hasav");

        // await this.browser.page.waitForTimeout(2000);

        // const s = 'input[type="checkbox"]';

        // await this.browser.page.evaluate((s) => {
        //   const checkboxes = document.querySelectorAll(s);
        //   if (checkboxes.length >= 2) {
        //     checkboxes[1].click(); // Click the second checkbox (index 1)
        //     return true;
        //   }
        //   return false;
        // }, s);

        // console.log("✅ Second checkbox checked");

        // await this.browser.page.waitForTimeout(2000);

        // await this.browser.takeScreenshot("services-page");

        // const element = await this.browser.page.$("#book-appointment-btn");

        // await this.browser.takeScreenshot("login-successful-page");

        const bookingUrl =
          "https://visas-de.tlscontact.com/en-us/3242808/workflow/appointment-booking?location=amEVN2de";

        await this.browser.page.goto(bookingUrl, {
          waitUntil: "networkidle2",
          timeout: 30000,
        });

        // await element.click({ count: 1 });

        // await this.browser.page.waitForTimeout(2000);
        await setTimeout(2000);

        // console.log("clicked book appointment button");

        // await this.browser.takeScreenshot("booking-page-loaded");

        await this.tst();
      } else {
        // Check for error messages on the page
        const errorSelectors = [
          ".error-message",
          ".alert-danger",
          ".login-error",
          '[class*="error"]',
          ".invalid-feedback",
          ".field-error",
        ];

        let errorMessage = "Unknown login error";
        for (const selector of errorSelectors) {
          try {
            const errorElement = await this.browser.page.$(selector);
            if (errorElement) {
              errorMessage = await errorElement.textContent();
              break;
            }
          } catch (e) {
            // Continue
          }
        }

        throw new Error(
          `Login failed: ${errorMessage}. Current URL: ${currentUrl}`
        );
      }
    } catch (error) {
      logger.error("Login failed:", error);
      // await this.browser.takeScreenshot("login-error");
      throw error;
    }
  }

  async navigateToGermanVisaBooking() {
    try {
      logger.info("Navigating to German visa booking page...");

      // Take screenshot of current page after login
      // await this.browser.takeScreenshot("after-successful-login");

      // Look for Germany visa booking options
      const germanVisaSelectors = [
        'a[href*="germany"]',
        'a[href*="german"]',
        'a[href*="de"]',
        ".country-germany",
        ".visa-germany",
        'button:contains("Germany")',
        'a:contains("Germany")',
        'a:contains("German")',
        'a:contains("Deutschland")',
        '[data-country="germany"]',
        '[data-country="de"]',
      ];

      let foundGermanyLink = false;
      for (const selector of germanVisaSelectors) {
        try {
          const elements = await this.browser.page.$$(selector);
          for (const element of elements) {
            const text = await element.textContent();
            if (
              text &&
              (text.toLowerCase().includes("germany") ||
                text.toLowerCase().includes("german"))
            ) {
              await element.click();
              foundGermanyLink = true;
              logger.info(`Found and clicked Germany visa link: ${text}`);
              break;
            }
          }
          if (foundGermanyLink) break;
        } catch (e) {
          // Continue to next selector
        }
      }

      if (!foundGermanyLink) {
        // Try to find country selection dropdown
        const countrySelectors = [
          "#country",
          "select[name='country']",
          ".country-select",
          "#destination-country",
          "select[name='destination']",
        ];

        for (const selector of countrySelectors) {
          try {
            const element = await this.browser.page.$(selector);
            if (element) {
              await this.browser.selectOption(selector, "germany");
              foundGermanyLink = true;
              logger.info("Selected Germany from dropdown");
              break;
            }
          } catch (e) {
            // Continue
          }
        }
      }

      if (!foundGermanyLink) {
        logger.warn(
          "Could not find Germany visa selection - proceeding with general booking"
        );
      }

      // await this.browser.page.waitForTimeout(3000);
      await setTimeout(3000);
      // await this.browser.takeScreenshot("germany-selection");

      return true;
    } catch (error) {
      logger.error("Failed to navigate to German visa booking:", error);
      // await this.browser.takeScreenshot("navigation-error");
      return false;
    }
  }

  async checkAvailableSlots() {
    try {
      logger.info("Checking for available German visa appointment slots...");

      // await this.browser.takeScreenshot("appointment-page");

      // await this.browser.page.waitForTimeout(2000);
      await setTimeout(2000);

      // Wait for calendar to load
      if (
        !(await this.browser.waitForSelector(
          ".calendar, .appointment-calendar, .date-picker",
          10000
        ))
      ) {
        logger.warn("Calendar not found");
        return [];
      }

      // Look for available dates
      const availableSlots = await this.browser.page.evaluate(() => {
        const slots = [];

        // Common selectors for available dates
        const availableDates = document.querySelectorAll(
          ".available-date, .date-available, .calendar-day:not(.disabled):not(.unavailable), .appointment-slot, .bookable-date"
        );

        availableDates.forEach((slot) => {
          const dateText = slot.textContent?.trim();
          const dateValue =
            slot.getAttribute("data-date") || slot.getAttribute("value");

          if (
            dateText &&
            !slot.classList.contains("disabled") &&
            !slot.classList.contains("unavailable")
          ) {
            slots.push({
              element: slot,
              date: dateValue || dateText,
              text: dateText,
            });
          }
        });

        return slots.map((slot) => ({
          date: slot.date,
          text: slot.text,
        }));
      });

      logger.info(
        `Found ${availableSlots.length} available German visa appointment slots`
      );
      return availableSlots;
    } catch (error) {
      logger.error("Error checking available slots:", error);
      return [];
    }
  }

  async checkAndBookAppointment() {
    try {
      if (!this.isLoggedIn) {
        throw new Error("Not logged in");
      }

      // Navigate to German visa booking page
      if (!(await this.navigateToGermanVisaBooking())) {
        throw new Error("Failed to navigate to German visa booking page");
      }

      // Check for available slots
      const availableSlots = await this.checkAvailableSlots();

      if (availableSlots.length > 0) {
        logger.info(
          `Found ${availableSlots.length} available German visa appointments`
        );
        await notifier.notify(
          "available",
          `Found ${availableSlots.length} available German visa slots!`,
          {
            availableSlots: availableSlots.slice(0, 5),
            country: config.tls.country,
            visaType: config.tls.visaType,
          }
        );
      } else {
        logger.info("No available German visa appointments found");
      }

      return availableSlots.length > 0;
    } catch (error) {
      logger.error("Error in checkAndBookAppointment:", error);
      throw error;
    }
  }

  async retry() {
    if (this.retryCount < config.bot.maxRetries) {
      this.retryCount++;
      logger.info(
        `Retrying German visa booking... Attempt ${this.retryCount}/${config.bot.maxRetries}`
      );
      await this.browser.page.waitForTimeout(5000);
      return await this.checkAndBookAppointment();
    }
    return false;
  }
}

module.exports = TLSBot;
