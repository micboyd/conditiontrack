const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
	{
		userId:       { type: String, required: true },
		mode:         { type: String, default: 'simple', enum: ['simple', 'advanced'] },
		title:        { type: String, required: true },
		description:  { type: String, default: '' },
		category:     { type: String, default: null },
		trackingType: { type: String, default: 'manual', enum: ['manual', 'auto'] },
		metric:       { type: String, default: null },
		period:       { type: String, default: null },
		exerciseName: { type: String, default: null },
		direction:    { type: String, default: 'increase', enum: ['increase', 'decrease'] },
		targetValue:  { type: Number, default: 0 },
		startValue:   { type: Number, default: 0 },
		currentValue: { type: Number, default: 0 },
		unit:         { type: String, default: '' },
		targetDate:   { type: String, default: null },
		notes:        { type: String, default: '' },
		status:       { type: String, default: 'active', enum: ['active', 'completed', 'archived'] },
		milestones: [{
			title:       { type: String, required: true },
			targetDate:  { type: String, default: null },
			completed:   { type: Boolean, default: false },
			completedAt: { type: String, default: null },
		}],
	},
	{ timestamps: true },
);

module.exports = mongoose.model('Goal', goalSchema);
