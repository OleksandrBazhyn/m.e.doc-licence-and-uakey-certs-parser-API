const { Builder, Browser, By, until, Key } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const Debuger = require("./Debuger");

class UakeyParser {
    constructor() {
        this.driver = null;
    }

    async init(debugMode = false) {
        if (debugMode) console.log(`UakeyParser: Initializing WebDriver...`);

        let options = new chrome.Options();
        if (!debugMode) {
            options.addArguments("--headless", "--window-size=1920,1080");
        }

        this.driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
    }

    async dispose(debugMode = false) {
        if (debugMode) console.log("UakeyParser: Disposing WebDriver...");
        if (this.driver) {
            await this.driver.quit();
        }
        if (debugMode) console.log("UakeyParser: WebDriver disposed.");
    }

    async waitForElement(selector, timeout = 5000) {
        return await this.driver.wait(until.elementLocated(By.css(selector)), timeout);
    }

    async getFullInfo(USREOU, debugMode = false) {
        let debuger;
        try {
            if (!this.driver) throw new Error("Driver not initialized");
            debuger = new Debuger(this.driver);
    
            if (debugMode) console.log("UakeyParser: Navigating to https://uakey.com.ua/");
            await this.driver.get("https://uakey.com.ua/");
            await this.driver.wait(until.elementLocated(By.css("body")), 1000);
            if (debugMode) console.log("UakeyParser: Page loaded!");
    
            // Open modal window directly by modifying its attributes
            if (debugMode) console.log("UakeyParser: Opening search modal manually...");
            await this.driver.executeScript(`
                let modal = document.getElementById("searchEcp");
                if (modal) {
                    modal.classList.add("in");
                    modal.style.display = "block";
                }
            `);
            await this.driver.sleep(500); // Wait a bit to ensure UI updates
    
            let inputField = await this.driver.wait(
                until.elementLocated(By.css('.search-signature')),
                5000
            );
    
            // Click on input field to focus
            await inputField.click();
    
            // Clear the input field
            await inputField.clear();
    
            // Send USREOU as keystrokes
            await inputField.sendKeys(USREOU, Key.RETURN);
    
            // Wait for the results to load
            await this.driver.wait(until.elementLocated(By.css(".search-results")), 5000);
            
            // Extracting data from the search results
            let results = await this.driver.findElements(By.css(".search-results .result-item"));
            let parsedResults = [];
            
            for (let result of results) {
                let name = await result.findElement(By.css(".company-name")).getText();
                let code = await result.findElement(By.css(".company-code")).getText();
                let address = await result.findElement(By.css(".company-address")).getText();
                
                parsedResults.push({ name, code, address });
            }
            
            if (debugMode) console.log("Parsed Results:", parsedResults);
            
            return parsedResults;
        } catch (err) {
            console.error("[ERROR] Exception in getFullInfo:", err);
            if (debuger) {
                const getFormattedDate = () => {
                    const now = new Date();
                    return now.toISOString().replace(/[:.]/g, '-'); // Забираємо проблемні символи
                };
                
                await debuger.takeScreenshot(`error-${getFormattedDate()}.png`, debugMode);
                await debuger.getPageSource(`error_page_source-${getFormattedDate()}.html`, debugMode);                
            }
            return null;
        }
    }  
}

// Testing script
(async () => {
    let parser = new UakeyParser();
    try {
        let debugMode = true;
        await parser.init(debugMode);
        await parser.getFullInfo(27272727, debugMode);
    } catch (err) {
        console.error("[FATAL ERROR]", err);
    } finally {
        await parser.dispose(true);
    }
})();
