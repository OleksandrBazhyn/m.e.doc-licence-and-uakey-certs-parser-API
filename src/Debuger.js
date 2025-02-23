import fs from "node:fs";
import path from "node:path";

class Debuger {
    constructor(driver, debugMode = false) {
        this.driver = driver;
        this.debugDir = path.join(process.cwd(), "./debug/");

        this.debugMode = debugMode;

        if (!fs.existsSync(this.debugDir)) {
            fs.mkdirSync(this.debugDir, { recursive: true });
        }
    }

    async takeScreenshot(filename = "screenshot.png") {
        if (!this.debugMode || !this.driver) return;
        try {
            const filePath = path.join(this.debugDir, filename);
            console.log(`[DEBUG] Taking screenshot: ${filePath}`);
            let image = await this.driver.takeScreenshot();
            fs.writeFileSync(filePath, image, "base64");
        } catch (err) {
            console.error("[ERROR] Failed to save screenshot:", err);
        }
    }

    async getPageSource(filename = "page_source.html") {
        if (!this.debugMode || !this.driver) return;
        try {
            const filePath = path.join(this.debugDir, filename);
            console.log(`[DEBUG] Saving page source: ${filePath}`);
            let source = await this.driver.getPageSource();
            fs.writeFileSync(filePath, source, "utf-8");
        } catch (err) {
            console.error("[ERROR] Failed to save page source:", err);
        }
    }
}

export default Debuger;
