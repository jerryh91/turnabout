var express = require('express');
var router = express.Router();
var filteredProfiles = [
    { id: "1", username: "BobbyBoy", image_src: "http://24.media.tumblr.com/tumblr_m3fqbmn8cF1qe4cuxo1_500.jpg", points: "628", detail: "I live by myself, I pay my own rent, I wear socks that match and I love my mom. I am a confident, attractive & comedic person. I do stunt work. Have you ever seen it in a movie when a hot actor has to reveal his naked ass? That’s my job. Oh, and I’m in the fitness biz, as well as back in school finishing up my pre-med reqs." },
    { id: "2", username: "some_guy", image_src: "http://25.media.tumblr.com/tumblr_m3d737UrjX1rurzxho1_400.jpg", points: "2043", detail: "Basically I love life and I love living life. I enjoy the outdoors, traveling, restaurants, laughing, goIng to cultural events, and sociaLizing with quality peOple. Its just better liVing and sharing lifE with someone else"},
    { id: "3", username: "ns_3225", image_src: "https://s-media-cache-ak0.pinimg.com/236x/9b/13/83/9b13836f4523e4fb332aa588b3ba1cf1.jpg", points: "105", detail: "64% Introvert, 36% Extrovert. Analytical, kinesthetic thinker. The spotlight is not my friend. Anti-planner, pro spontaneity. A shy geek and a smooth operator…. that’s approximately me." },
    { id: "4", username: "THEONEANDONLY", image_src: "https://s-media-cache-ak0.pinimg.com/236x/5c/3c/fa/5c3cfadac848470ae8f00c0b1e2aa4ae.jpg", points: "4123", detail: "Hey :)" },
    { id: "5", username: "goals23", image_src: "http://regent.blogs.com/photos/uncategorized/2008/12/23/83494618.jpg", points: "1408", detail: "I'm new in town. Looking for new friends." }
  ];


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
	if (req.query.location) {
    	res.json(filteredProfiles);
  	} else {
		res.render('search', {title: 'express'});
  	}
});

// router.route('/search')
// .get(function(req, res) {

// 	//Query from MongoDB
// 	res.render('index', {title: 'express'});

// });

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
