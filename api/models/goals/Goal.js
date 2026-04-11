const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
	{
		userId:       { type: String, required: true },
		title:        { type: String, required: true },
		category:     { type: String, required: true, enum: ['strength', 'cardio', 'nutrition', 'body-composition'] },
		trackingType: { type: String, required: true, enum: ['manual', 'auto'] },
		metric:       { type: String, default: null },
		period:       { type: String, default: null },
		exerciseName: { type: String, default: null },
		direction:    { type: String, default: 'increase', enum: ['increase', 'decrease'] },
		targetValue:  { type: Number, required: true },
		startValue:   { type: Number, default: 0 },
		currentValue: { type: Number, default: 0 },
		unit:         { type: String, required: true },
		targetDate:   { type: String, default: null },
		notes:        { type: String, default: '' },
		status:       { type: String, default: 'active', enum: ['active', 'completed'] },
	},
	{ timestamps: true },
);

module.exports = mongoose.model('Goal', goalSchema);
