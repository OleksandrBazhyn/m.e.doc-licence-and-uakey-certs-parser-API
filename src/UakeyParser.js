import { Builder, Browser, By, until, Key, chrome } from "selenium-webdriver";
import Debuger from "./Debuger.js";

class UakeyParser {
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
        if (this.debugMode) console.log(`UakeyParser: ${message}`);
    }

    async navigateTo(url) {
        this.log(`Navigating to ${url}`);
        await this.driver.get(url);
        await this.driver.wait(until.elementLocated(By.css("body")), 1000);
    }

    async openSearchModal() {
        this.log("Opening search modal manually...");
        await this.driver.executeScript(`
            let modal = document.getElementById("searchEcp");
            if (modal) {
                modal.classList.add("in");
                modal.style.display = "block";
            }
        `);
        await this.driver.sleep(500);
    }

    async searchUSREOU(USREOU) {
        const inputField = await this.waitForElement(".search-signature");
        await inputField.click();
        await inputField.clear();
        await inputField.sendKeys(USREOU, Key.RETURN);
        await this.driver.sleep(2000);
    }

    async extractCertificates() {
        this.log("Extracting certificate data...");
        const rows = await this.driver.findElements(By.css(".overflow.actual .popup-input-result-row"));
        if (rows.length === 0) {
            this.log("No results found.");
            return [];
        }
        
        return Promise.all(rows.map(async (row) => {
            return {
                cloudkey: (await row.findElements(By.css(".result-item-name.cloud img"))).length > 0,
                name: await row.findElement(By.css(".result-item-name:not(.cloud) p")).getText(),
                endDate: await row.findElement(By.css(".result-item-date")).getText(),
                certType: await row.findElement(By.css(".result-item-use p")).getText(),
                signType: await row.findElement(By.css(".result-item-use span")).getText(),
                downloadLink: await row.findElement(By.css(".result-item-img a")).getAttribute("href"),
            };
        }));
    }

    async getFullInfo(USREOU) {
        if (!this.driver) throw new Error("Driver not initialized");
        const debuger = new Debuger(this.driver, this.debugMode);

        try {
            await this.navigateTo("https://uakey.com.ua/");
            await this.openSearchModal();
            await this.searchUSREOU(USREOU);
            return await this.extractCertificates();
        } catch (err) {
            console.error("[ERROR] Exception in getFullInfo:", err);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            await debuger.takeScreenshot(`error-${timestamp}.png`);
            await debuger.getPageSource(`error_page_source-${timestamp}.html`);
            return null;
        }
    }

    async waitForElement(selector, timeout = 5000) {
        return await this.driver.wait(until.elementLocated(By.css(selector)), timeout);
    }
}

export default UakeyParser;
