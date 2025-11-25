require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Import Routes
const bannerRoutes = require('./routes/banners');
const analyticsRoutes = require('./routes/analytics');
const Banner = require('./models/Banner'); // Imported for seeding only

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --- Database Connection ---
// In Render, set the 'DB_URI' environment variable to your connection string.
const dbUri = process.env.DB_URI || 'mongodb://localhost:27017/AnnounceItDB'; // Fallback for local dev

mongoose.connect(dbUri)
  .then(() => {
    console.log('MongoDB connected!');
    seedDatabase(); // Optional: Seeds default data if empty
  })
  .catch(err => console.error('MongoDB connection error:', err));

// --- Routes ---
// Mounts banner routes at /api/banners
// Example: GET /api/banners/config
app.use('/api/banners', bannerRoutes);

// Mounts analytics routes at /api/track
// Example: POST /api/track/:id
app.use('/api/track', analyticsRoutes);

// Root Endpoint (Health Check)
app.get('/', (req, res) => {
    res.send('AnnounceIt Backend is running.');
});

// --- Helper: Seed Database ---
const seedDatabase = async () => {
    try {
        const count = await Banner.countDocuments();
        if (count === 0) {
            await Banner.create({
                name: "Welcome Popup (Default)",
                type: "popup",
                status: "active",
                pages: ["/"],
                content: {
                    text: "Get 10% off your first order!",
                    font: "Inter, sans-serif",
                    bgColor: "#ffffff", 
                    textColor: "#1e293b",
                    position: "bottom-right",
                    btnEnabled: true,
                    btnText: "Subscribe",
                    btnLink: "#", 
                    btnColor: "#000000",
                    btnTextColor: "#ffffff"
                },
                schedule: { 
                    start: new Date().toISOString(),
                    end: "2030-12-31T23:59", 
                    timezone: "GMT+0" 
                },
                stats: { views: 0, clicks: 0 }
            });
            console.log('Database seeded with default banner.');
        }
    } catch (err) {
        console.log("Seeding skipped or failed:", err.message);
    }
};

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});