const express = require('express');
const rateLimit = require('express-rate-limit');
const service = require('../services/research-data');
const router = express.Router();
router.use(rateLimit({ windowMs: 5 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false }));
router.get('/providers', (_req, res) => res.json({ success: true, data: service.providerDirectory }));
router.get('/company/:ticker', async (req, res) => {
    try {
        service.normalize(req.params.ticker);
        const data = await service.companyResearch(req.params.ticker, { includeFundamentals: req.query.fundamentals === 'true' });
        res.json({ success: true, data });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
module.exports = router;
