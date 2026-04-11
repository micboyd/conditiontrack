const mongoose = require('mongoose');

const trainingBlockSchema = new mongoose.Schema({
	userId:    { type: String, required: true },
	name:      { type: String, required: true },
	startDate: { type: String, required: true },  // 'yyyy-MM-dd'
	endDate:   { type: String, default: null },    // null = open-ended
	notes:     { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('TrainingBlock', trainingBlockSchema);
