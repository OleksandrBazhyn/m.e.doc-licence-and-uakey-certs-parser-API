import UakeyParser from "./UakeyParser.js";
import MedocParser from "./MedocParser.js";
import fs from "node:fs";

(async () => {
    const USREOU = [2804120785, 2424];
    const debugMode = true;

    const uakeyParser = new UakeyParser();
    const medocParser = new MedocParser(debugMode);
    
    try {
        await uakeyParser.init();
        await medocParser.init();
        //await medocParser.getFullInfo(USREOU); //
        
        let orgs = await fs.readFileSync("orgs.txt", "utf-8");
        orgs = orgs.split("\r\n");
        const uakeyCerts = await uakeyParser.getFullInfo(orgs);
        fs.writeFileSync("certificates.json", JSON.stringify(uakeyCerts, null, 2), "utf-8");
        console.log("Uakey certificates saved successfully.");
    } catch (err) {
        console.error("[FATAL ERROR]", err);
    } finally {
        await uakeyParser.dispose();
        await medocParser.dispose();
    }
})();
