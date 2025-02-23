import { By, Key } from "selenium-webdriver";
import BaseParser from "./BaseParser.js";
import Debuger from "./Debuger.js";

class UakeyParser extends BaseParser {
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

        return Promise.all(rows.map(async (row) => ({
            cloudkey: (await row.findElements(By.css(".result-item-name.cloud img"))).length > 0,
            name: await row.findElement(By.css(".result-item-name:not(.cloud) p")).getText(),
            endDate: await row.findElement(By.css(".result-item-date")).getText(),
            certType: await row.findElement(By.css(".result-item-use p")).getText(),
            signType: await row.findElement(By.css(".result-item-use span")).getText(),
            downloadLink: await row.findElement(By.css(".result-item-img a")).getAttribute("href"),
        })));
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
}

export default UakeyParser;
