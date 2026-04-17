const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
	userId:     { type: String, required: true },
	date:       { type: String, required: true }, // 'yyyy-MM-dd'
	weight:     { type: Number, default: null },   // kg
	muscleMass: { type: Number, default: null },   // kg
	bodyFat:    { type: Number, default: null },   // %
	notes:      { type: String, default: '' },
	photoUrl:   { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Measurement', measurementSchema);
