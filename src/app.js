import UakeyParser from "./UakeyParser.js";
import fs from "node:fs";

(async () => {
    const debugMode = false;
    const parser = new UakeyParser(debugMode);
    
    try {
        await parser.init();
        const certs = await parser.getFullInfo(2804120785);
        
        if (certs) {
            fs.writeFileSync("certificates.json", JSON.stringify(certs, null, 2), "utf-8");
            console.log("Certificates saved successfully.");
        } else {
            console.warn("No certificates found or an error occurred.");
        }
    } catch (err) {
        console.error("[FATAL ERROR]", err);
    } finally {
        await parser.dispose();
    }
})();