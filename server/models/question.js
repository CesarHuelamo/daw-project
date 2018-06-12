const mongoose = require('mongoose');

var QuestionSchema = new mongoose.Schema({
	question: {
		type: String,
		required: true
	},
	answer: {
		type: String,
		required: true
	},
	eval: {
		type: Array,
		required: true
	},
	index: {
		type: Number,
		required: true
	}
});

let Question = mongoose.model('Question', QuestionSchema);

module.exports = { Question };
