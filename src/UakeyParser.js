const { Builder, Browser, By, until } = require("selenium-webdriver");
const Debuger = require("./Debuger");

class UakeyParser {
    constructor() {
        this.driver = null;
    }

    async init(headless = false, debugMode = false) {
        if (debugMode) console.log(`UakeyParser: Initializing WebDriver (headless=${headless})`);
        let options = headless ? { args: ["--headless", "--window-size=1920,1080"] } : {};
        this.driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
    }

    async dispose(debugMode = false) {
        if (debugMode) console.log("UakeyParser: Disposing WebDriver...");
        if (this.driver) {
            await this.driver.quit();
        }
        if (debugMode) console.log("UakeyParser: WebDriver disposed.");
    }

    async getFullInfo(USREOU, debugMode = false) {
        let debuger;
        try {
            if (!this.driver) throw new Error("Driver not initialized");
            debuger = new Debuger(this.driver);
    
            if (debugMode) console.log("UakeyParser: Navigating to https://uakey.com.ua/");
            await this.driver.get("https://uakey.com.ua/");
            await this.driver.wait(until.elementLocated(By.css("body")), 500);
            if (debugMode) console.log("UakeyParser: Page loaded!");
    
            // Check burger menu
            if (debugMode) console.log("UakeyParser: Checking for burger menu...");
            let burgerMenu = await this.driver.findElements(By.css(".hamburger.js-hamburger"));
            if (burgerMenu.length > 0) {
                let isActive = await burgerMenu[0].getAttribute("class");
                if (debugMode) console.log(`UakeyParser: Burger menu found, class: ${isActive}`);
    
                if (!isActive.includes("is-active")) {
                    if (debugMode) console.log("UakeyParser: Clicking burger menu to expand...");
                    await this.driver.wait(until.elementIsVisible(burgerMenu[0]), 2000);
                    await this.driver.executeScript("arguments[0].click();", burgerMenu[0]);
                    await this.driver.sleep(500);
                }
            }
    
            // Click the button
            if (debugMode) console.log("UakeyParser: Searching for button...");
            let button = await this.driver.wait(
                until.elementLocated(By.css('a[data-toggle="modal"][data-target="#searchEcp"]')),
                5000
            );
            if (debugMode) console.log("UakeyParser: Button found!");
    
            await this.driver.wait(until.elementIsVisible(button), 5000);
            if (debugMode) console.log("UakeyParser: Clicking button...");
            await this.driver.executeScript("arguments[0].click();", button);
            if (debugMode) console.log("UakeyParser: Button clicked!");
    
            await debuger.takeScreenshot("button_clicked.png", debugMode);
            await debuger.getPageSource("page_source_after.html", debugMode);
        } catch (err) {
            console.error("[ERROR] Exception in getFullInfo:", err);
            if (debuger) {
                await debuger.takeScreenshot("error.png", debugMode);
                await debuger.getPageSource("error_page_source.html", debugMode);
            }
        }
    }    
}

// Developing test
(async () => {
    let parser = new UakeyParser();
    try {
        let debugMode = true;
        await parser.init(true, debugMode);
        await parser.getFullInfo(111, debugMode);
    } catch (err) {
        console.error("[FATAL ERROR]", err);
    } finally {
        await parser.dispose(true);
    }
})();
