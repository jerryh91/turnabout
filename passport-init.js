var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');

//temp user data
//TODO: Hook w/ MongoDB
var users = {};

module.exports = function (passport)
{
    //Authentication APIs

    passport.use('signup', new LocalStrategy (
    {
        passReqToCallback : true
    },

    //passport can parse 
    //username, password from a form body
    function (req, username, password, true)
    {

        //TODO: Check if user already in MongoDB
        if(users[username])
        {
            return done('User :'+ username + 'already exists', false);
        }

        //Create new user 
        users [username] = 
        {
            username : username;
            password : createHash(password);
        };

        return done(null, users[username]);
    })
    );

    passport.use(new LocalStrategy(
      function(username, password, done) {
        User.findOne({ username: username }, function(err, user) {
          if (err) { return done(err); }
          if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
          }
          if (!user.validPassword(password)) {
            return done(null, false, { message: 'Incorrect password.' });
          }
          return done(null, user);
        });
      }
    ));

}