const { Builder, Browser, By, until } = require("selenium-webdriver");
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
        let debuger = new Debuger(this.driver);

        try {
            if (!this.driver) throw new Error("Driver not initialized");

            if (debugMode) console.log("UakeyParser: Navigating to https://uakey.com.ua/");
            await this.driver.get("https://uakey.com.ua/");
            await this.driver.wait(until.elementLocated(By.css("body")), 3000);
            if (debugMode) console.log("UakeyParser: Page loaded!");

            // Handle burger menu if it exists
            try {
                let burgerMenu = await this.driver.findElements(By.css(".hamburger.js-hamburger"));
                if (burgerMenu.length > 0) {
                    let isActive = await burgerMenu[0].getAttribute("class");
                    if (!isActive.includes("is-active")) {
                        if (debugMode) console.log("UakeyParser: Expanding burger menu...");
                        await this.driver.executeScript("arguments[0].click();", burgerMenu[0]);
                        await this.driver.sleep(500);
                    }
                }
            } catch (error) {
                if (debugMode) console.log("UakeyParser: No burger menu found or clickable.");
            }

            // Handle search button click
            try {
                let button = await this.waitForElement('a[data-toggle="modal"][data-target="#searchEcp"]');
                await this.driver.wait(until.elementIsVisible(button), 3000);
                if (debugMode) console.log("UakeyParser: Clicking search button...");
                await this.driver.executeScript("arguments[0].click();", button);
                if (debugMode) console.log("UakeyParser: Button clicked!");
            } catch (error) {
                throw new Error("Failed to find or click search button.");
            }

            await debuger.takeScreenshot("button_clicked.png", debugMode);
            await debuger.getPageSource("page_source_after.html", debugMode);

        } catch (err) {
            console.error("[ERROR] Exception in getFullInfo:", err);
            await debuger.takeScreenshot("error.png", debugMode);
            await debuger.getPageSource("error_page_source.html", debugMode);
        }
    }
}

// Testing script
(async () => {
    let parser = new UakeyParser();
    try {
        let debugMode = true;
        await parser.init(debugMode);
        await parser.getFullInfo(111, debugMode);
    } catch (err) {
        console.error("[FATAL ERROR]", err);
    } finally {
        await parser.dispose(true);
    }
})();
