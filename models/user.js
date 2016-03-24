var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
mongoose.connect('mongodb://localhost/nodeauth');
var db = mongoose.connection;

// User schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	password: {
		type: String,
		required: true,		// to make this step required
		bcrypt: true
	},
	email: {
		type: String
	},
	name: {
		type: String
	},
	profileimage: {		// the image name to put into the DB. Not the actual image
		type: String
	}
});

var User = module.exports = mongoose.model('User', UserSchema);		// makes the User object accessible outside the user.js file

module.exports.comparePassword = function(candidatePassword, hash, callback) {
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
		if (err) {
			return callback(err);
		}
		
		callback(null, isMatch);
	});
};

module.exports.getUserByUsername = function(username, callback) {
	var query = { username: username };
	User.findOne(query, callback);
};

module.exports.getUserById = function(id, callback) {
	User.findById(id, callback);		// findById is a Mongoose function
};

module.exports.createUser = function(newUser, callback) {
	bcrypt.hash(newUser.password, 10, function(err, hash) {
		if (err) {
			throw err;
		}
		
		// Set hashed password
		newUser.password = hash;
		
		// Create User
		newUser.save(callback);
	});
	
}