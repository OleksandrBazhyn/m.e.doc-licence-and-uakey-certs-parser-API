import UakeyParser from "./UakeyParser.js";
import fs from "node:fs";

// Testing script
(async () => {
    let parser = new UakeyParser();
    try {
        let debugMode = true;
        await parser.init(debugMode);
        let certs = await parser.getFullInfo(27272727, debugMode);
        fs.writeFileSync("certificates.json", JSON.stringify(certs, null, 2), "utf-8");
    } catch (err) {
        console.error("[FATAL ERROR]", err);
    } finally {
        await parser.dispose(true);
    }
})();