const UakeyParser = require("./UakeyParser");

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