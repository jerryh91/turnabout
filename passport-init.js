var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');

//temp user data
//TODO: Hook w/ MongoDB
var users = {};

module.exports = function (passport)
{
    //Authentication APIs

    //Passport needs to be able to serialize and deserialize users 
    //to support persistent login sessions

    //Passport requires that we provide a unique ID which 
    //specifies each user in order to serialize them into the session. 
    //TODO: Investigate deeper into purpose of de/serialize
    passport.serializeUser(function(user, done) 
    {
        console.log('serializing user:',user.username);
        return done(null, user.username));
    });

    //Desieralize user will call with the unique id provided by serializeuser
    passport.deserializeUser(function(username, done) 
    {

        return done(null, users[username]);

    });


    passport.use('login', new LocalStrategy(
      {
              passReqToCallback : true
      },
    
      function(req, username, password, done) 
      { 

    
              if (!users[username])
              {
                //User doesn't exist in db
                return done('user:' + username + 'NOT in db', false);
              }
              else if (!isValidPwd(users[username], password))
              {
                return done('user:  '+ username + 'incorrect password', false);
              }

              //Successful login
              console.log('Successfully signed in');
              return done(null, users[username]);
      })
    );

    passport.use('signup', new LocalStrategy (
      {
        //Pass entire req to call back function
          passReqToCallback : true
      },

      //passport can parse 
      //username, password from a form body
      function (req, username, password, true)
      {

          if(users[username])
          {
              return done('User :'+ username + 'already exists', false);
          }

          //Create new user 
          users [username] = 
          {
              username : username,
              password : createHash(password)
          }

          console.log(users[username].username + ' Registration successful');
          return done(null, users[username]);
      })
    );

    // passport.use(new LocalStrategy(
    //   function(username, password, done) {
    //     User.findOne({ username: username }, function(err, user) {
    //       if (err) { return done(err); }
    //       if (!user) {
    //         return done(null, false, { message: 'Incorrect username.' });
    //       }
    //       if (!user.validPassword(password)) {
    //         return done(null, false, { message: 'Incorrect password.' });
    //       }
    //       return done(null, user);
    //     });
    //   }
    // ));
    

    //Compare user submitted password to user password in db
    var isValidPwd = function(user, password)
    {

      return bCrypt.compareSync(password, user.password);
    };

    var createHash = function(password)
    {
      return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };

}