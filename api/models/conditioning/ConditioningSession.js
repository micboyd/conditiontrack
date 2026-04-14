const mongoose = require('mongoose');

const conditioningSessionSchema = new mongoose.Schema({
    name:      { type: String, required: true },
    duration:  { type: Number, required: true, min: 1 },
    category:  { type: String, required: true },
    userId:    { type: String, required: true },
    purpose:   { type: String, default: '' },
    howToUse:  { type: String, default: '' },
    parts: [{
        part: { type: String, default: '' },
        work: { type: String, default: '' },
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model('ConditioningSession', conditioningSessionSchema);