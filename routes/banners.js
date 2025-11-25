const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');

// GET /api/banners/config
// Public endpoint for the Shopify Storefront Snippet
// Returns only ACTIVE banners matching current time and page
router.get('/config', async (req, res) => {
    const currentUrl = req.query.path || "/";
    const now = new Date(); 

    try {
        // 1. Fetch active banners
        const activeBanners = await Banner.find({ status: 'active' });

        // 2. Filter based on Page and Schedule
        const validBanners = activeBanners.filter(b => {
            // Path Check
            if (!b.pages.includes(currentUrl) && !b.pages.includes("ALL")) return false;

            // Date Check
            if (b.schedule.start && new Date(b.schedule.start) > now) return false;
            if (b.schedule.end && new Date(b.schedule.end) < now) return false;

            return true;
        });

        res.json(validBanners);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/banners
// Admin endpoint: Fetch all banners for Dashboard
router.get('/', async (req, res) => {
    try {
        const banners = await Banner.find().sort({ createdAt: -1 });
        res.json(banners);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/banners
// Create or Update a banner
router.post('/', async (req, res) => {
    const data = req.body;
    
    // COLLISION CHECK: Ensure no two active banners of same type on same page
    if (data.status === 'active') {
        const conflict = await Banner.findOne({
            _id: { $ne: data.id }, // Exclude self if updating
            status: 'active',
            type: data.type,
            pages: { $in: data.pages }
        });

        if (conflict) {
            return res.status(409).json({ error: `Conflict: Active ${data.type} banner already exists on this page.` });
        }
    }

    try {
        let banner;
        if (data.id) {
            // Update
            banner = await Banner.findByIdAndUpdate(data.id, data, { new: true });
        } else {
            // Create
            data.stats = { views: 0, clicks: 0 }; // Reset stats
            banner = await Banner.create(data);
        }
        res.json({ success: true, banner });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/banners/:id/status
// Pause/Resume functionality
router.post('/:id/status', async (req, res) => {
    const { status } = req.body;
    const bannerId = req.params.id;

    try {
        const banner = await Banner.findById(bannerId);
        if (!banner) return res.status(404).json({ error: "Banner not found" });

        // Collision Check if Resuming
        if (status === 'active') {
            const conflict = await Banner.findOne({
                _id: { $ne: bannerId },
                status: 'active',
                type: banner.type,
                pages: { $in: banner.pages }
            });

            if (conflict) {
                return res.status(409).json({ error: "Cannot resume: An active banner overlaps with this one." });
            }
        }

        banner.status = status;
        await banner.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/banners/:id
router.delete('/:id', async (req, res) => {
    try {
        await Banner.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;