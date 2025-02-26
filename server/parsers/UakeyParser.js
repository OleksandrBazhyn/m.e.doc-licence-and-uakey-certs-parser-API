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
        await this.driver.sleep(1000);

        const rows = await this.driver.findElements(By.css(".overflow.actual .popup-input-result-row"));
        if (rows.length === 0) {
            this.log("No results found.");
            return [];
        }

        const certs = await Promise.all(rows.map(async (row) => {
            try {
                const rawDate = await this.getTextSafe(row, ".result-item-date");
                const dateMatch = rawDate.match(/^(\d{2}\.\d{2}\.\d{4}) - (\d{2}\.\d{2}\.\d{4})$/);
                const startDate = dateMatch ? dateMatch[1] : null;
                const endDate = dateMatch ? dateMatch[2] : null;

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
                return;
            }
        }));
        
        return certs;
    }
    
    async getTextSafe(row, selector) {
        const elements = await row.findElements(By.css(selector));
        return elements.length ? await elements[0].getText() : "";
    }
    
    async getAttributeSafe(row, selector, attribute) {
        const elements = await row.findElements(By.css(selector));
        return elements.length ? await elements[0].getAttribute(attribute) : "";
    }

    async getFullInfo(USREOUList) {
        if (!this.driver) throw new Error("Driver not initialized");
        const debuger = new Debuger(this.driver, this.debugMode);
    
        if (!Array.isArray(USREOUList)) {
            USREOUList = [USREOUList];
        }
    
        USREOUList = USREOUList.map(String);    
        
        const results = {};
    
        try {
            await this.navigateTo("https://uakey.com.ua/");
            await this.openSearchModal();
    
            for (const USREOU of USREOUList) {
                if (USREOU.length < 8) {
                    results[USREOU] = {
                        code: USREOU,
                        certs: []
                    };
                    continue;
                }
                await this.searchUSREOU(USREOU);
                const certs = await this.extractCertificates(USREOU);
                results[USREOU] = {
                    code: USREOU,
                    certs: certs
                };
            }
    
            return results;
        } catch (err) {
            console.error("[ERROR] Exception in getFullInfo:", err);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            await debuger.takeScreenshot(`error-${timestamp}.png`);
            await debuger.getPageSource(`error_page_source-${timestamp}.html`);
            return;
        }
    }    
}

export default UakeyParser;
