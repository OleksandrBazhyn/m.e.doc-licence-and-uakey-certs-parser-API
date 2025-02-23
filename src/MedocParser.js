import { By, until, Key } from "selenium-webdriver";
import BaseParser from "./BaseParser.js";
import Debuger from "./Debuger.js";

class MedocParser extends BaseParser {
    async searchUSREOU(USREOU) {
        const recapcha = await this.waitForElement(".recaptcha-checkbox-border");
        await recapcha.click();

        const inputField = await this.waitForElement(".edrpou");
        await inputField.click();
        await inputField.clear();
        await inputField.sendKeys(USREOU, Key.RETURN);
        await this.driver.sleep(10000);

        await this.driver.wait(until.elementLocated(By.css(".popupRes")), 5000);
    }

    async getFullInfo(USREOU) {
        if (!this.driver) throw new Error("Driver not initialized");
        const debuger = new Debuger(this.driver, this.debugMode);

        try {
            await this.navigateTo("https://medoc.ua/getcode");
            await this.searchUSREOU(USREOU);
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
