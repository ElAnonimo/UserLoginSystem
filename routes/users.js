var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register', { 'title': 'Register' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { 'title': 'Log in' });
});

router.post('/register', function(req, res, next) {
	// Get form values
	var name = req.body.name;		// field's name
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var confirmpassword = req.body.confirmpassword;

	// Check for image field
	// if (req.files.profileimage) {  // req.files for array upload, req.file for single file upload. Same for File info entries below
	if (req.file) {
		console.log('Uploading the profile image...');
		
		// File info
		var profileImageOriginalName = req.file.profileimage.originalname;		// the name before the upload
		var profileImageName = req.file.profileimage.name;						// the name given by the server on upload
		var profileImageMime = req.file.profileimage.mimetype;						
		var profileImagePath = req.file.profileimage.path;					
		var profileImageExtension = req.file.profileimage.extension;						
		var profileImageSize = req.file.profileimage.size;						
	} else {
		// Set a default image
		var profileimageName = 'noimage.png';
	}

	// Form validation
	req.checkBody('name', 'Name field is required').notEmpty();
	req.checkBody('email', 'Email field is required').notEmpty();
	req.checkBody('email', 'Email not valid').isEmail();
	req.checkBody('username', 'Username field is required').notEmpty();
	req.checkBody('password', 'Password field is required').notEmpty();
	req.checkBody('confirmpassword', 'Passwords do not match').equals(req.body.password);
	
	// Check for errors
	var errors = req.validationErrors();
	
	if (errors) {
		res.render('register', {
			errors: errors,
			name: name,
			email: email,
			username: username,
			password: password,
			confirmpassword: confirmpassword
		});
	} else {
		var newUser = new User({
			name: name,
			email: email,
			username: username,
			password: password,
			profileimage: profileimageName
		});
		
 		// Create User
		User.createUser(newUser, function(err, user) {
			if (err) {
				throw err;
			}
			console.log(user);
		});
		
		// Success flash message
		req.flash('success', 'You are now registered and may log in');
		res.location('/');
		res.redirect('/');
	}
});

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
		done(err, user);
	});
});

passport.use(new LocalStrategy(function(username, password, done) { // done is a callback
	User.getUserByUsername(username, function(err, user) {
		if (err) {
			throw err;
		};
		
		if ( ! user) {
			console.log('Unknown user');
			return done(null, false, { message: 'Unknown user' });
		}
		
		User.comparePassword(password, user.password, function(err, isMatch) {
			if (err) {
				throw err;
			};
			
			if (isMatch) {
				return done(null, user);
			} else {
				console.log('Invalid password');
				return done(null, false, { message: 'Invalid password' });
			}
		});
	});
}));

router.post('/login', passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: 'Invalid username or password' }), function(req, res) {
	// code here runs when LocalStrategy returns true i.e. when user authenticates. 'local' for authentication against the local DB
	console.log('Authentication successful');
	req.flash('success', 'You are logged in');
	res.redirect('/');
});

router.get('/logout', function(req, res) {
	req.logout();
	req.flash('success', 'You have logged out');
	res.redirect('/users/login');
});

module.exports = router;
