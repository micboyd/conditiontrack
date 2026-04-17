const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema(
	{
		userId: { type: String, required: true },
		name: { type: String, required: true },
		description: { type: String, required: true },
		exercises: [
			{
				name:        { type: String, required: true },
				defaultSets: { type: Number, default: 3 },
				defaultReps: { type: Number, default: 10 },
			},
		],
		showInWeekPlanner: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

module.exports = mongoose.model('Workout', workoutSchema);
