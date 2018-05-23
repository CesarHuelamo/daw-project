const mongoose = require('mongoose');
const validator = require('validator');

var UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		minlength: 1,
		validate: {
			validator: validator.isEmail,
			message: '{VALUE} is not a valid email'
		}
	},
	nick: {
		type: String,
		require: true,
		unique: true,
		trim: true,
		minLength: 1
	},
	password: {
		type: String,
		required: true,
		minLength: 8
	},
	token: {
		type: String,
		required: true,
		unique: true
	}
});

let User = mongoose.model('User', UserSchema);

module.exports = { User };
