var express = require('express');
var router = express.Router();



router.route('/')
.get(function(req, res) {

	//Query from MongoDB
	res.render('index', {title: 'express'});

});

router.route('/home')
.get(function(req, res) {

	//Query from MongoDB
	res.render('home', {title: 'express'});

});

router.route('/test1')
.get(function(req, res) {

	//Query from MongoDB
	res.render('test1', {title: 'express'});

});

router.route('/test2')
.get(function(req, res) {

	//Query from MongoDB
	res.render('test2', {title: 'express'});

});

router.route('/browse')
.get(function(req, res) {

	//Query from MongoDB
	res.render('browse', {title: 'express'});

});

router.route('/profile')
.get(function(req, res) {

	//Query from MongoDB
	res.render('profile', {title: 'express'});

});

router.route('/search')
.get(function(req, res) {

	//Query from MongoDB
	res.render('search', {title: 'express'});

});

router.route('/page2')

.get(function(req, res) {

	//Query data from MongoDB

	//package as JSON
	var data = {name: 'Jerry', supplies:['broom', 'mop', 'dustpan']};
	res.render('page2',  data);

});


//RESTFul API: CRUD
router.route('/profiles')

//req: from client
//res: from server

.get(function(req, res) {

	//Query from MongoDB
	res.send({message: 'Return all profiles'});

});

// /profiles/:<any alpha numeric>

router.route('/profiles/:id')

.get(function(req, res) {

		var profileID = req.params.id;
		//Query profileID from MongoDB
		res.send({message: 'Return profile: ' + profileID});
})

//.put: update existing profile with id
.put(function(req, res) {

		var profileID = req.params.id;
		//Query profileID from MongoDB
		res.send({message: 'Update profile: ' + profileID})

})

.delete(function(req, res) {

		var profileID = req.params.id;
		//delete profileID from MongoDB
		res.send({message: 'Delete profile: ' + profileID})

})


//TODO: How to grab other field data from form?
// .post(function(req, res) {

// 	var profileID = req.params.id;
// 	//Add to MongoDB
// 	res.send({message: 'Create profile: ' + profileID});
// });	


module.exports = router;
