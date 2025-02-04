const { Builder, Browser, By, until } = require("selenium-webdriver");

class UakeyParser {
    constructor() {
        this.driver = null;
    }

    async init() {
        if (!this.driver) {
            this.driver = await new Builder().forBrowser(Browser.CHROME).build();
        }
    }

    async dispose() {
        console.log("UakeyParser disposed.");
        if (this.driver) {
            await this.driver.quit();
            this.driver = null;
        }
    }

    async getFullInfo(USREOU) {
        try {
            await this.init();

            await this.driver.get("https://uakey.com.ua/");
            console.log("UakeyParser: Page loaded successfully!");

            let button = await this.driver.wait(
                until.elementLocated(By.css('a[data-toggle="modal"][data-target="#searchEcp"]')),
                1000
            );
            
            await button.click();
            console.log("Button was clicked!");
        } catch (err) {
            console.error(err);
        }
    }
}

// Використання
(async () => {
    const parser = new UakeyParser();
    try {
        await parser.getFullInfo(111);
    } catch (err) {
        console.error(err);
    } finally {
        await parser.dispose();
    }
})();
