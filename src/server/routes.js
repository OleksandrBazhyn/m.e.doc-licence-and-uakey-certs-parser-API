import express from "express";
import { getUakeyData, getMedocData } from "./fetchData.js";
import NodeCache from "node-cache";

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 });

router.get("/uakey", async (req, res) => {
    const { usreou } = req.query;
    if (!usreou) return res.status(400).json({ error: "USREOU code is required" });

    const cacheKey = `uakey_${usreou}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json({ fromCache: true, ...cachedData });

    try {
        const data = await getUakeyData(usreou);
        cache.set(cacheKey, data);
        res.json({ fromCache: false, ...data });
    } catch (err) {
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

router.get("/medoc", async (req, res) => {
    const { usreou } = req.query;
    if (!usreou) return res.status(400).json({ error: "USREOU code is required" });

    const cacheKey = `medoc_${usreou}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json({ fromCache: true, ...cachedData });

    try {
        const data = await getMedocData(usreou);
        cache.set(cacheKey, data);
        res.json({ fromCache: false, ...data });
    } catch (err) {
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

router.get("/company", async (req, res) => {
    const { usreou } = req.query;
    if (!usreou) return res.status(400).json({ error: "USREOU code is required" });

    try {
        const [uakeyCerts, licenses] = await Promise.all([
            getUakeyData(usreou),
            getMedocData(usreou),
        ]);

        res.json({ fromCache: false, uakeyCerts, licenses });
    } catch (err) {
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

export default router;
