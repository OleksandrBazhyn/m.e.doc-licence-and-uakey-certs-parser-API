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

    async extractCertificates(USREOU) {
        this.log("Extracting certificate data...");
        
        const rows = await this.driver.findElements(By.css(".overflow.actual .popup-input-result-row"));
        if (rows.length === 0) {
            this.log("No results found.");
            return {
                errorId: 1,
                errorDescription: "No results found.",
                data: null
            };
        }
    
        const data = await Promise.all(rows.map(async (row) => {
            try {
                const rawDate = await this.getTextSafe(row, ".result-item-date");
    
                const { startDate, endDate } = (() => {
                    const match = rawDate.match(/^(\d{2}\.\d{2}\.\d{4}) - (\d{2}\.\d{2}\.\d{4})$/);
                    return match ? { startDate: match[1], endDate: match[2] } : { startDate: "", endDate: "" };
                })();
    
                return {
                    code: USREOU,
                    cloudkey: (await row.findElements(By.css(".result-item-name.cloud img"))).length > 0,
                    name: await this.getTextSafe(row, ".result-item-name:not(.cloud) p"),
                    startDate,
                    endDate,
                    certType: await this.getTextSafe(row, ".result-item-use p"),
                    signType: await this.getTextSafe(row, ".result-item-use span"),
                    downloadLink: await this.getAttributeSafe(row, ".result-item-img a", "href"),
                };
            } catch (error) {
                this.log(`[ERROR] Failed to extract certificate: ${error.message}`);
                return {
                    errorId: 2,
                    errorDescription: "Failed to extract certificate.",
                    data: null
                };
            }
        }));
    
        return {
            errorId: 0,
            data
        };
    }
    
    async getTextSafe(row, selector) {
        const elements = await row.findElements(By.css(selector));
        return elements.length ? await elements[0].getText() : "";
    }
    
    async getAttributeSafe(row, selector, attribute) {
        const elements = await row.findElements(By.css(selector));
        return elements.length ? await elements[0].getAttribute(attribute) : "";
    }
    

    async getFullInfo(USREOU) {
        if (!this.driver) throw new Error("Driver not initialized");
        const debuger = new Debuger(this.driver, this.debugMode);

        try {
            await this.navigateTo("https://uakey.com.ua/");
            await this.openSearchModal();
            await this.searchUSREOU(USREOU);
            return await this.extractCertificates(USREOU);
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
