const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['popup', 'side'], required: true },
    status: { type: String, enum: ['active', 'paused'], default: 'active' },
    pages: [String], // Target URLs

    // Design & Content
    content: {
        text: String,
        font: String,
        bgColor: String,
        textColor: String,
        position: { type: String, enum: ['top-right', 'bottom-right'] },
        // CTA Button
        btnEnabled: Boolean,
        btnText: String,
        btnLink: String,
        btnColor: String,
        btnTextColor: String
    },

    // Scheduling
    schedule: {
        start: String, // ISO Date String
        end: String,   // ISO Date String
        timezone: String
    },

    // Aggregated Stats (Fast read for Dashboard)
    stats: {
        views: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 }
    }
}, { timestamps: true });

// Convert _id to id for frontend compatibility
bannerSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

module.exports = mongoose.model('Banner', bannerSchema);