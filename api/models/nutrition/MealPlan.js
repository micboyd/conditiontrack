const mongoose = require('mongoose');

const MealPlanEntrySchema = new mongoose.Schema(
	{
		day: { type: String, required: true }, // 'Monday' – 'Sunday'
		slot: { type: String, required: true }, // 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'
		mealId: { type: String, required: true },
	},
	{ _id: false }
);

const MealPlanSchema = new mongoose.Schema(
	{
		userId: { type: String, required: true },
		weekStart: { type: String, required: true }, // 'YYYY-MM-DD' — always a Monday
		entries: [MealPlanEntrySchema],
	},
	{ timestamps: true }
);

// One plan per user per week
MealPlanSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model('MealPlan', MealPlanSchema);
