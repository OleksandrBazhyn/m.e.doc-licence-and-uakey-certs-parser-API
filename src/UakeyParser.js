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
            return {
                errorId: 1,
                errorDescription: "No results found.",
                data: []
            };
        }

        const data = await Promise.all(rows.map(async (row) => {
            try {
                const rawDate = await this.getTextSafe(row, ".result-item-date");
                const dateMatch = rawDate.match(/^(\\d{2}\.\d{2}\.\d{4}) - (\d{2}\.\d{2}\.\d{4})$/);
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
                return {
                    errorId: 2,
                    errorDescription: "Failed to extract certificate.",
                    data: null
                };
            }
        }));

        const hasErrors = data.some(item => item.errorId);
        
        return {
            errorId: hasErrors ? 2 : 0,
            errorDescription: hasErrors ? "Some certificates failed to extract." : "Success",
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

    async getFullInfo(USREOUList) {
        if (!this.driver) throw new Error("Driver not initialized");

        if (!Array.isArray(USREOUList)) {
            USREOUList = [USREOUList];
        }

        const debuger = new Debuger(this.driver, this.debugMode);
        const results = [];

        try {
            await this.navigateTo("https://uakey.com.ua/");
            await this.openSearchModal();
            
            for (const USREOU of USREOUList) {
                if (USREOU.toString().length < 8) {
                    results.push({ USREOU, ...{
                        errorId: 3,
                        errorDescription: "Invalid identifier entered.",
                        data: null
                    } });
                    continue;
                }
                await this.searchUSREOU(USREOU);
                const result = await this.extractCertificates(USREOU);
                results.push({ USREOU, ...result });
            }

            return {
                errorId: 0,
                errorDescription: "Success",
                results
            };
        } catch (err) {
            console.error("[ERROR] Exception in getFullInfo:", err);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            await debuger.takeScreenshot(`error-${timestamp}.png`);
            await debuger.getPageSource(`error_page_source-${timestamp}.html`);
            return {
                errorId: 3,
                errorDescription: "Unexpected error occurred.",
                results
            };
        }
    }
}

export default UakeyParser;
