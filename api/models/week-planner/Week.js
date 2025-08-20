const mongoose = require('mongoose');

const dayPlanSchema = new mongoose.Schema(
	{
		dayName: {
			type: String,
			enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
			required: true,
		},
		workouts: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Workout',
			},
		],
		conditioning: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'ConditioningSession',
			},
		],
	}
);

const weekPlanSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		days: {
			type: [dayPlanSchema],
			default: () => [
				{ dayName: 'Monday', workouts: [], conditioning: [] },
				{ dayName: 'Tuesday', workouts: [], conditioning: [] },
				{ dayName: 'Wednesday', workouts: [], conditioning: [] },
				{ dayName: 'Thursday', workouts: [], conditioning: [] },
				{ dayName: 'Friday', workouts: [], conditioning: [] },
				{ dayName: 'Saturday', workouts: [], conditioning: [] },
				{ dayName: 'Sunday', workouts: [], conditioning: [] },
			],
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model('WeekPlan', weekPlanSchema);
