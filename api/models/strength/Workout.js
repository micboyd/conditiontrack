const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema(
	{
		userId: { type: String, required: true },
		name: { type: String, required: true },
		description: { type: String, required: true },
		exercises: [
			{
				userId: { type: String, required: true },
				name: { type: String, required: true },
				description: { type: String, required: true },
			},
		],
	},
	{ timestamps: true },
);

module.exports = mongoose.model('Workout', workoutSchema);
