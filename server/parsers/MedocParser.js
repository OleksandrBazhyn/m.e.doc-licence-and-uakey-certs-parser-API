import { By, until, Key } from "selenium-webdriver";
import BaseParser from "./BaseParser.js";
import Debuger from "./Debuger.js";
import axios from "axios";

const apiKey = process.env.CAPSOLVER_API_KEY;
const websiteKey = process.env.WebSiteKey;
const websiteURL = "https://medoc.ua/getcode";

class MedocParser extends BaseParser {
    async solveCaptcha() {
        if (!apiKey) {
            this.log("[ERROR] Captcha solving failed. No api key. Aborting.");
            return;
        }

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
        try{
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
        } catch (err) {
            this.log(`[ERROR] There is no information for this code. Please check that you entered your USREOU code correctly and try again.: ${err}`);
            return;
        }        
    }
    
    async extractLicenseInfo(USREOU) {
        this.log("Extracting license data...");
        
        try {
            const popupRes = await this.driver.wait(async () => {
                const elements = await this.driver.findElements(By.css(".popupRes"));
                return elements.length > 0 ? elements[0] : null;
            }, 2000);
    
            const licenses = await popupRes.findElements(By.css(".popupRes-dateEnd .row:first-of-type .col-md-5"));
    
            const license = await Promise.all(licenses.map(async (lic) => {
                try {
                    const rows = await lic.findElements(By.css(".popupRes-dateEnd-item-row"));
                    const modules = await Promise.all(rows.map(async (m, index) => {                    
                        let elements = await m.findElements(By.css("ul li"));
                    
                        if (elements.length < 2) {
                            console.log(`Not enough items in row ${index}, skipping`);
                            return {
                                module: null,
                                moduleExpire: null
                            };
                        }
                    
                        const moduleText = await elements[0].getText();
                        const expireText = await elements[1].getText();
                                            
                        return {
                            module: moduleText.trim() || null,
                            moduleExpire: expireText.trim() || null
                        };
                    }));
                    
                    return {
                        code: USREOU,
                        licenseType: (await this.getTextSafe(lic, ".license")).trim(),
                        blank: (await this.getTextSafe(lic, ".blank")).trim(),
                        modules
                    };
                } catch (err) {
                    this.log(`[ERROR] Failed to extract detailed license information: ${err.message}`);
                    return;
                }
            }));
    
            return license;
        } catch (error) {
            this.log(`[ERROR] Failed to extract license information: ${error.message}`);
            return [];
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

    async getFullInfo(USREOUList) {
        if (!this.driver) throw new Error("Driver not initialized");
        const debuger = new Debuger(this.driver, this.debugMode);

        if (!Array.isArray(USREOUList)) {
            USREOUList = [USREOUList];
        }

        USREOUList = USREOUList.map(String);

        const results = {};

        try {
            for (const USREOU of USREOUList) {
                if (USREOU.length < 8) {
                    results[USREOU] = {
                        code: USREOU,
                        license: []
                    };
                    continue;
                }

                await this.navigateTo("https://medoc.ua/getcode");
                const withoutLicense = await this.searchUSREOU(USREOU);

                if (withoutLicense) {
                    results[USREOU] = {
                        code: USREOU,
                        license: withoutLicense
                    };
                    continue;
                }
                
                const license = await this.extractLicenseInfo(USREOU); 
                results[USREOU] = {
                    code: USREOU,
                    license: license
                };
            }

            return results
        } catch (err) {
            console.error("[ERROR] Exception in getFullInfo:", err);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            await debuger.takeScreenshot(`error-${timestamp}.png`);
            await debuger.getPageSource(`error_page_source-${timestamp}.html`);
            return;
        }
    }
}

export default MedocParser;
