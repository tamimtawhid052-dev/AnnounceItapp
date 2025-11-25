const mongoose = require('mongoose');

const analyticEventSchema = new mongoose.Schema({
    bannerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Banner', required: true },
    eventType: { type: String, enum: ['view', 'click'], required: true },
    timestamp: { type: Date, default: Date.now },
    meta: Object // Optional: URL, User Agent, etc.
});

module.exports = mongoose.model('AnalyticEvent', analyticEventSchema);