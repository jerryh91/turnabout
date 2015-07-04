var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Post = mongoose.model('Post');

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
        console.log('serializing user:',user._id);
        return done(null, user._id);
    });

    passport.deserializeUser(function(id, done) 
    {
        //Find user with _id
        User.findById (id, function (err, user)
        {
          if (err)
          {
            return done(err, false);
          }

          if (!user)
          {
            return done('user not found', false);
          }
          //return user obj to passport
          return done(user, true);
        })
    
    });

    passport.use('login', new LocalStrategy(
    {
            passReqToCallback : true,
            usernameField: 'username', // this is the default, but adding for clarity
            passwordField: 'password'  // this is the default, but adding for clarity
    },
    
      function(req, username, password, done) 
      { 

            User.findOne({'username' : username}, function(err, user){

              if (err)
              {
                return done("db err: "+ err, false);
              }

              if (!user)
              {
                //User doesn't exist in db
                return done('user:' + username + 'NOT in db', false);
              }
              else if (!isValidPwd(user, password))
              {
                return done('user:  '+ username + 'incorrect password', false);
              }
              //Successful login
              console.log('Successfully signed in');
              return done(null, user);
            });
      }
    ));

    passport.use('signup', new LocalStrategy(
    {
        passReqToCallback : true,
        usernameField: 'username', // this is the default, but adding for clarity
        passwordField: 'password'  // this is the default, but adding for clarity
    },

      //passport can parse 
      //username, password from a form body
      function (req, username, password, done)
      { 
          console.log("in signup");
        // console.log('signup function callback');
          User.findOne({'username': username}, function(err, user)
          {
                if (err)
                {
                  console.log('err');
                  return done(err, false);
                }
                
                if (user)
                {
                  console.log('user exists');
                  //User already in db
                  return done('user:' + username + 'already in db', false);
                } else
                {
                  console.log('creating new user');
                  //Create new user
                  var newUser = new User ();
                  newUser.username = username;
                  newUser.password = createHash(password);

                  newUser.save(function(err, newUser)
                    {
                      if (err)
                      {
                        return (err, false);
                      }
                     
                      console.log('Successfully signed up user: ' + username);
                      return done(null, newUser);
                    });
                }
                
              });

          // if(users[username])
          // {
          //     return done('User :'+ username + 'already exists', false);
          // }

          // //Add new username:password
          // users [username] = 
          // {
          //     username : username,
          //     password : createHash(password)
          // };

          // return done(null, users[username]);
      })
    );

    var isValidPwd = function(user, password)
    {

      return bCrypt.compareSync(password, user.password);
    };

    var createHash = function(password)
    {
      return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };
   

}