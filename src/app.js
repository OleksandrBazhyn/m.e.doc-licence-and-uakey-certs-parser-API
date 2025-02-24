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
    const USREOU = [2804120785];
    const debugMode = false;

    const uakeyParser = new UakeyParser(debugMode);
    const medocParser = new MedocParser(debugMode);
    
    try {
        await uakeyParser.init();
        
        let orgs = await fs.promises.readFile("orgs.txt", "utf-8");
        orgs = orgs.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);

        // const certsExpire = await findCertificatesExpire(orgs);
        const uakeyCerts = await uakeyParser.getFullInfo(orgs);

        // await fs.promises.writeFile("certificatesTERM.json", JSON.stringify(certsExpire, null, 2), "utf-8");
        await fs.promises.writeFile("certificates.json", JSON.stringify(uakeyCerts, null, 2), "utf-8");

        console.log("Uakey certificates saved successfully.");


        await medocParser.init();

        const licenses = await medocParser.getFullInfo(orgs);

        await fs.promises.writeFile("licenses.json", JSON.stringify(licenses, null, 2), "utf-8");

        console.log("MEDoc license information saved successfully.");
    } catch (err) {
        console.error("[FATAL ERROR]", err);
    } finally {
        if (uakeyParser) await uakeyParser.dispose();
        if (medocParser) await medocParser.dispose();
    }
})();
