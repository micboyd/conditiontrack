// models/ConditioningRecord.js
const mongoose = require('mongoose');

const conditioningRecordSchema = new mongoose.Schema(
	{
		userId: { type: String, required: true }, // reference to user
		sessionId: { type: String, required: true },
		date: { type: Date, required: true, default: Date.now }, // when the session took place
		duration: { type: Number, required: true, min: 1 }, // actual time spent (minutes)
		notes: { type: String, default: '' }, // user’s personal notes or feedback
		completed: { type: Boolean, default: false }, // whether the session was finished
		caloriesBurned: { type: Number, default: 0, min: 0 },
	},
	{
		timestamps: true, // adds createdAt and updatedAt
	},
);

// Optional: avoid duplicate records for same user/session/date combo
// conditioningRecordSchema.index({ userId: 1, sessionId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('ConditioningRecord', conditioningRecordSchema);
