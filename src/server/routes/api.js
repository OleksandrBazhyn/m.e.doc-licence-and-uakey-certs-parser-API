import express from "express";
import MedocParser from "../parsers/MedocParser.js";
import UakeyParser from "../parsers/UakeyParser.js";

const router = express.Router();

router.get("/search/:usreou", async (req, res) => {
    const usreou = req.params.usreou;
    const medocParser = new MedocParser(true);
    const uakeyParser = new UakeyParser(true);

    try {
        await medocParser.init();
        const medocData = await medocParser.getFullInfo(usreou);
        await medocParser.dispose();

        await uakeyParser.init();
        const uakeyData = await uakeyParser.getFullInfo(usreou);
        await uakeyParser.dispose();

        res.json({ medoc: medocData, uakey: uakeyData });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data", errorDescription: error});
    }
});

export default router;
