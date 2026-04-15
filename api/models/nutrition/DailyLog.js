const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema(
	{
		userId: { type: String, required: true },
		date: { type: String, required: true }, // stored as 'YYYY-MM-DD'
		meals: [{ type: String }], // array of Meal _id strings
		extraCaloriesBurned: { type: Number, default: 0 },
	},
	{ timestamps: true },
);

// One log per user per calendar day
dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyLog', dailyLogSchema);
