import { Builder, Browser, By, until, Key } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import Debuger from "./Debuger.js";

class MedocParser {
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
        if (this.debugMode) console.log(`MedocParser: ${message}`);
    }

    async waitForElement(selector, timeout = 5000) {
        return await this.driver.wait(until.elementLocated(By.css(selector)), timeout);
    }

    async navigateTo(url) {
        this.log(`Navigating to ${url}`);
        await this.driver.get(url);
        await this.driver.wait(until.elementLocated(By.css("body")), 1000);
    }

    async getFullInfo(USREOU) {
        if (!this.driver) throw new Error("Driver not initialized");
        const debuger = new Debuger(this.driver, this.debugMode);

        try {
            await this.navigateTo("https://medoc.ua/getcode");
            
        } catch (err) {
            console.error("[ERROR] Exception in getFullInfo:", err);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            await debuger.takeScreenshot(`error-${timestamp}.png`);
            await debuger.getPageSource(`error_page_source-${timestamp}.html`);
            return null;
        }
    }
}

export default MedocParser;