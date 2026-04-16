const mongoose = require('mongoose');

const timeBlockSchema = new mongoose.Schema(
	{
		workouts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workout' }],
		conditioning: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ConditioningSession' }],
	},
	{ _id: false },
);

const emptyBlock = () => ({ workouts: [], conditioning: [] });

const dayPlanSchema = new mongoose.Schema({
	dayName: {
		type: String,
		enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
		required: true,
	},
	// Overarching (all-day) items — original behaviour
	workouts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workout' }],
	conditioning: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ConditioningSession' }],
	// Time blocks
	morning:   { type: timeBlockSchema, default: emptyBlock },
	afternoon: { type: timeBlockSchema, default: emptyBlock },
	evening:   { type: timeBlockSchema, default: emptyBlock },
});

const weekPlanSchema = new mongoose.Schema(
	{
		userId:    { type: String, required: true },
		weekStart: { type: String },
		days: {
			type: [dayPlanSchema],
			default: () => [
				{ dayName: 'Monday',    workouts: [], conditioning: [], morning: emptyBlock(), afternoon: emptyBlock(), evening: emptyBlock() },
				{ dayName: 'Tuesday',   workouts: [], conditioning: [], morning: emptyBlock(), afternoon: emptyBlock(), evening: emptyBlock() },
				{ dayName: 'Wednesday', workouts: [], conditioning: [], morning: emptyBlock(), afternoon: emptyBlock(), evening: emptyBlock() },
				{ dayName: 'Thursday',  workouts: [], conditioning: [], morning: emptyBlock(), afternoon: emptyBlock(), evening: emptyBlock() },
				{ dayName: 'Friday',    workouts: [], conditioning: [], morning: emptyBlock(), afternoon: emptyBlock(), evening: emptyBlock() },
				{ dayName: 'Saturday',  workouts: [], conditioning: [], morning: emptyBlock(), afternoon: emptyBlock(), evening: emptyBlock() },
				{ dayName: 'Sunday',    workouts: [], conditioning: [], morning: emptyBlock(), afternoon: emptyBlock(), evening: emptyBlock() },
			],
		},
	},
	{ timestamps: true },
);

weekPlanSchema.index({ userId: 1, weekStart: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('WeekPlan', weekPlanSchema);
