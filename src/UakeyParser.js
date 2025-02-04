const { Builder, Browser } = require("selenium-webdriver");

class UakeyParser {
    static driver = null;

    static async init() {
        if (!UakeyParser.driver) {
            UakeyParser.driver = await new Builder().forBrowser(Browser.CHROME).build();
        }
    }

    static async dispose() {
        console.log("UakeyParser disposed");
        if (UakeyParser.driver) {
            await UakeyParser.driver.quit();
            UakeyParser.driver = null;
        }
    }
}

// Developing test
(async () => {
    try {
        await UakeyParser.init();

        await UakeyParser.driver.get("https://simbad.u-strasbg.fr/simbad/sim-basic?submit=SIMBAD+search&Ident=TIC+103509957");

        console.log("Page loaded successfully!");
    } catch (err) {
        console.error(err);
    } finally {
        await UakeyParser.dispose();
    }
})();
