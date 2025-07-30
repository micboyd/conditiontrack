const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema(
	{
        notes: { type: String, required: false },
        duration: { type: Number, required: true },
		userId: { type: String, required: true },
		workoutId: { type: String, required: true },
		date: { type: Date, default: Date.now },
		exercises: [
			{
				name: { type: String, required: true },
				sets: [
                    {
                        reps: { type: Number, required: true },
                        weight: { type: Number, required: true },
                    }
                ],
			},
		],
	},
	{ timestamps: true },
);

module.exports = mongoose.model('WorkoutRecord', workoutSchema);
