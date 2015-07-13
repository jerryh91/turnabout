var express = require('express');
var router = express.Router();

module.exports = function(passport){

    //log in
    // router.post('/login', passport.authenticate('login', {
    //     successRedirect: '/auth/success',
    //     failureRedirect: '/auth/failure'
    // }));

    //sign up
    router.post('/signup', passport.authenticate('local'), function(req, res){
        res.sendStatus(200);
    });

     //sends successful login state back to angular
    router.get('/success', function(req, res){
        console.log("went through the /success GET");
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
        res.redirect('/');
    });

    return router;
}