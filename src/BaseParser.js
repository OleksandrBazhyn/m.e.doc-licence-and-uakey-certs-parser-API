import { Builder, Browser, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

class BaseParser {
    constructor(debugMode = false) {
        this.driver = null;
        this.debugMode = debugMode;
    }

    async init() {
        this.log("Initializing WebDriver...");
        const options = new chrome.Options();
        if (!this.debugMode) {
            options.addArguments("--headless", "--window-size=1920,1080");
        }
        this.driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
    }

    async dispose() {
        this.log("Disposing WebDriver...");
        if (this.driver) {
            await this.driver.quit();
            this.driver = null;
        }
    }

    log(message) {
        if (this.debugMode) console.log(`${this.constructor.name}: ${message}`);
    }

    async navigateTo(url) {
        this.log(`Navigating to ${url}`);
        await this.driver.get(url);
        await this.driver.wait(until.elementLocated(By.css("body")), 1000);
    }

    async waitForElement(selector, timeout = 5000) {
        return await this.driver.wait(until.elementLocated(By.css(selector)), timeout);
    }
}

export default BaseParser;
