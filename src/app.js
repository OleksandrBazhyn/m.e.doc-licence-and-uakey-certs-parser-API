import UakeyParser from "./UakeyParser.js";
import MedocParser from "./MedocParser.js";
import fs from "node:fs";

async function findCertificatesExpire(USREOUList) {
    try {
        const parser = new UakeyParser();
        await parser.init();

        const uakeyCerts = await parser.getFullInfo(USREOUList);

        let codes = new Set();
        const date = /\b03\.2025\b/;

        for (let comp of uakeyCerts.results) {
            for (let cert of comp.data) {
                if (!date.test(cert.endDate)) {
                    continue;
                }
                codes.add(cert.code);
            }
        }

        await parser.dispose();
        return Array.from(codes);
    } catch (err) {
        console.error("Error in method findCertificatesExpire:", err);
        return [];
    }
}

(async () => {
    const USREOU = [2804120785, 2424];
    const debugMode = true;

    const uakeyParser = new UakeyParser();
    const medocParser = new MedocParser(debugMode);
    
    try {
        await uakeyParser.init();
        await medocParser.init();
        
        // let orgs = await fs.promises.readFile("orgs.txt", "utf-8");
        // orgs = orgs.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);

        // const certsExpire = await findCertificatesExpire(orgs);
        const uakeyCerts = await uakeyParser.getFullInfo(USREOU);

        // await fs.promises.writeFile("certificatesTERM.json", JSON.stringify(certsExpire, null, 2), "utf-8");
        await fs.promises.writeFile("certificates.json", JSON.stringify(uakeyCerts, null, 2), "utf-8");

        console.log("Uakey certificates saved successfully.");
    } catch (err) {
        console.error("[FATAL ERROR]", err);
    } finally {
        if (uakeyParser) await uakeyParser.dispose();
        if (medocParser) await medocParser.dispose();
    }
})();
