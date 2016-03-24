var express = require('express');
var router = express.Router();

/* GET home page. AKA Members' page */
router.get('/', ensureAuthenticated, function(req, res, next) {
  res.render('index', { title: 'Members' });
});

function ensureAuthenticated(req, res, next) {		// using Passport authentication API
	if (req.isAuthenticated()) {
		return next();		// move to the next middleware
	};
	
	res.redirect('/users/login');
};

module.exports = router;
