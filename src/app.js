import UakeyParser from "./UakeyParser.js";

// Testing script
(async () => {
    let parser = new UakeyParser();
    try {
        let debugMode = true;
        await parser.init(debugMode);
        await parser.getFullInfo(2804120785, debugMode);
    } catch (err) {
        console.error("[FATAL ERROR]", err);
    } finally {
        await parser.dispose(true);
    }
})();