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
	note: { type: String, default: '' },
	workouts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workout' }],
	conditioning: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ConditioningSession' }],
	morning:   { type: timeBlockSchema, default: emptyBlock },
	afternoon: { type: timeBlockSchema, default: emptyBlock },
	evening:   { type: timeBlockSchema, default: emptyBlock },
});

const weekTemplateSchema = new mongoose.Schema(
	{
		userId:      { type: String, required: true },
		name:        { type: String, required: true },
		description: { type: String, default: '' },
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

weekTemplateSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model('WeekTemplate', weekTemplateSchema);
