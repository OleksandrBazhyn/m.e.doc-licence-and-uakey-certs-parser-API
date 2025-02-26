import express from "express";
import MedocParser from "../parsers/MedocParser.js";
import UakeyParser from "../parsers/UakeyParser.js";

const router = express.Router();

router.get("/search/:usreou", async (req, res) => {
    const usreou = req.params.usreou.split("+");
    const medocParser = new MedocParser();
    const uakeyParser = new UakeyParser();

    try {
        await medocParser.init();
        const medocData = await medocParser.getFullInfo(usreou);
        await medocParser.dispose();

        await uakeyParser.init();
        const uakeyData = await uakeyParser.getFullInfo(usreou);
        await uakeyParser.dispose();

        res.json({ medoc: medocData, uakey: uakeyData });
        res.status(200);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data", errorDescription: error});
    }
});

router.get("/uakey/:usreou", async (req, res) => {
    const usreou = req.params.usreou.split("+");
    const uakeyParser = new UakeyParser();

    try {
        await uakeyParser.init();
        const uakeyData = await uakeyParser.getFullInfo(usreou);
        await uakeyParser.dispose();

        res.json({ uakey: uakeyData });
        res.status(200);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data", errorDescription: error});
    }
});

router.get("/medoc/:usreou", async (req, res) => {
    const usreou = req.params.usreou.split("+");
    const uakeyParser = new UakeyParser();

    try {
        await medocParser.init();
        const medocData = await medocParser.getFullInfo(usreou);
        await medocParser.dispose();

        res.json({ medoc: medocData });
        res.status(200);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data", errorDescription: error});
    }
});

export default router;
