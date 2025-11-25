const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const AnalyticEvent = require('../models/AnalyticEvent');

// POST /api/track/:id
// Track Views and Clicks from the frontend
router.post('/:id', async (req, res) => {
    const { type } = req.body; // Expected: 'views' or 'clicks'
    const bannerId = req.params.id;

    if (!['views', 'clicks'].includes(type)) {
        return res.status(400).json({ error: "Invalid tracking type" });
    }

    try {
        // 1. Fast: Atomically increment aggregated stats on the Banner itself
        // This allows the Dashboard to load stats instantly without counting raw events
        await Banner.findByIdAndUpdate(bannerId, { 
            $inc: { [`stats.${type}`]: 1 } 
        });
        
        // 2. Slow (Async): Log raw event for future deep-dive analytics
        // We define eventType singular ('view' vs 'views') for cleaner data
        const eventType = type === 'views' ? 'view' : 'click';
        
        await AnalyticEvent.create({
            bannerId,
            eventType
        });

        res.json({ success: true });
    } catch (err) {
        console.error("Tracking error:", err);
        res.status(500).json({ error: "Failed to record tracking event" });
    }
});

module.exports = router;