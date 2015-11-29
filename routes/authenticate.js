var router = require('express').Router();

module.exports = function(passport){

    //check logged in
    router.get('/loggedIn', function(req, res) {
        if(req.user){
            res.json(req.user);

        } else {
            res.json({"notLoggedIn": "true"});
        }
    });

    //log in
    router.post('/login', passport.authenticate('login', {
        successRedirect: '/auth/success',
        failureRedirect: '/auth/failure'
    }));

    //sign up
    router.post('/signup', passport.authenticate('signup'), function(req, res){
        console.log(req.user);
        //res.sendStatus(200);
        // need to logout after creating account because the email address needs to be verified before they can log in
        req.logout();
        res.send(req.user);
    });

     //sends successful login state back to angular
    router.get('/success', function(req, res){
        //console.log("went through the /success GET");
        res.send({state: 'success', user: req.user ? req.user : null});
    });  

    //sends failure login state back to angular
    router.get('/failure', function(req, res){
        console.log("went through the /failure GET");
        res.send({state: 'failure', user: null, message: "Invalid username or password"});
    });

    //log out
    router.get('/signout', function(req, res) {
        //.logout(): a passport function
        req.logout();
        //res.redirect('/');
        res.render('index', {title: 'express'});
    });

    return router;
}