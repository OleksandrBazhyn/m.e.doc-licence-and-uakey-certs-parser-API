import UakeyParser from "./UakeyParser.js";
import MedocParser from "./MedocParser.js";
import fs from "node:fs";

(async () => {
    const USREOU = 2804120785;
    const debugMode = true;

    const uakeyParser = new UakeyParser(debugMode);
    const medocParser = new MedocParser(debugMode);
    
    try {
        await uakeyParser.init();
        const uakeyCerts = await uakeyParser.getFullInfo(USREOU);
        
        if (uakeyCerts) {
            fs.writeFileSync("certificates.json", JSON.stringify(uakeyCerts, null, 2), "utf-8");
            console.log("Uakey certificates saved successfully.");
        } else {
            console.warn("No Uakey certificates found or an error occurred.");
        }

        await medocParser.init();
        await medocParser.getFullInfo(USREOU);

    } catch (err) {
        console.error("[FATAL ERROR]", err);
    } finally {
        await uakeyParser.dispose();
        await medocParser.dispose();
    }
})();
