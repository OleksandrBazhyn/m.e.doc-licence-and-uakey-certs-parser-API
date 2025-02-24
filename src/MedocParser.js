import { By, until, Key } from "selenium-webdriver";
import BaseParser from "./BaseParser.js";
import Debuger from "./Debuger.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const apiKey = process.env.CAPSOLVER_API_KEY;
const websiteKey = "6LfdGkAUAAAAAAIGzEn-u1dYmw2lCBPb_HZXg9gQ";
const websiteURL = "https://medoc.ua/getcode";

class MedocParser extends BaseParser {
    async solveCaptcha() {
        const payload = {
            clientKey: apiKey,
            task: {
                type: 'ReCaptchaV2TaskProxyLess',
                websiteKey: websiteKey,
                websiteURL: websiteURL
            }
        };
    
        try {
            const res = await axios.post('https://api.capsolver.com/createTask', payload, {
                headers: { 'Content-Type': 'application/json' }
            });
    
            this.log(`API Response: ${JSON.stringify(res.data, null, 2)}`);
    
            const task_id = res.data.taskId;
            if (!task_id) {
                this.log(`Failed to create task: ${JSON.stringify(res.data, null, 2)}`);
                return null;
            }
            this.log(`Got taskId: ${task_id}`);
    
            while (true) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 1 second
    
                const getResultPayload = { clientKey: apiKey, taskId: task_id };
                const resp = await axios.post("https://api.capsolver.com/getTaskResult", getResultPayload, {
                    headers: { 'Content-Type': 'application/json' }
                });
    
                if (resp.data.status === "ready") {
                    return resp.data.solution.gRecaptchaResponse;
                }
                if (resp.data.status === "failed" || resp.data.errorId) {
                    this.log("Solve failed! response:", JSON.stringify(resp.data, null, 2));
                    return null;
                }
            }
        } catch (err) {
            console.error("[ERROR] Failed to solve captcha:", err);
            return null;
        }
    }
    
    async searchUSREOU(USREOU) {
        const token = await this.solveCaptcha();

        let revealed = await this.driver.findElement(By.css(".g-recaptcha"));
        await this.driver.wait(until.elementIsVisible(revealed), 2000);
    
        if (!token) {
            this.log("[ERROR] Captcha solving failed. Aborting.");
            return;
        }
    
        await this.driver.executeScript(`
            document.getElementsByClassName('edrpou')[0].value = arguments[0];

            document.getElementById('g-recaptcha-response').style.display = 'block';
            document.getElementById('g-recaptcha-response').value = arguments[1];

            var submitButton = document.getElementsByClassName('popup1-btn')[0]; 
            if (submitButton) {
                submitButton.click();
            }
        `, USREOU, token);

        await this.driver.wait(until.elementLocated(By.css(".popupRes")), 5000);
    }
    
    async extractLicenseInfo(USREOU) {
        this.log("Extracting license data...");
    
        try {
            const popupRes = await this.driver.wait(async () => {
                const elements = await this.driver.findElements(By.css(".popupRes"));
                return elements.length > 0 ? elements[0] : null;
            }, 2000);

            const licenses = await popupRes.findElements(By.css(".popupRes-dateEnd")).findElements(By.css(".col-md-5"));

            const data = await Promise.all(licenses.map(async (license) => {
                try {
                    return {
                        code: USREOU,
                        licenseType: await this.getTextSafe(license, ".license"),
                        blank: await this.getTextSafe(license, ".blank"),
                        data: await Promise.all((await license.findElements(By.css(".popupRes-dateEnd-item-row")).map(async (module) => {
                            // find all modules
                        }))),

                    }
                } catch (err) {
                    this.log(`[ERROR] Failed to extract detaile license information: ${error.message}`);
                    return {
                        errorId: 2,
                        errorDescription: "Failed to extract detaile license information.",
                        data: null
                    };
                }
            }));

            return {
                errorId: 0,
                data
            };
        } catch (error) {
            this.log(`[ERROR] Failed to extract license information: ${error.message}`);
            return {
                errorId: 1,
                errorDescription: "No results found.",
                data: null
            };
        }
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
            await this.navigateTo("https://medoc.ua/getcode");
            await this.searchUSREOU(USREOU);
            return await this.extractLicenseInfo(USREOU);
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
