import UakeyParser from "./UakeyParser.js";
import MedocParser from "./MedocParser.js";
import fs from "node:fs";

(async () => {
    const USREOU = 2804120785;
    const debugMode = false;
    // const UKparser = new UakeyParser(debugMode);
    const medocParser = new MedocParser(debugMode);
    
    try {
        // await UKparser.init();

        // const certs = await UKparser.getFullInfo(USREOU);
        
        // if (certs) {
        //     fs.writeFileSync("certificates.json", JSON.stringify(certs, null, 2), "utf-8");
        //     console.log("Certificates saved successfully.");
        // } else {
        //     console.warn("No certificates found or an error occurred.");
        // }


        await medocParser.init();
        
    } catch (err) {
        console.error("[FATAL ERROR]", err);
    } finally {
        await UKparser.dispose();
    }
})();