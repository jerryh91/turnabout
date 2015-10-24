var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var User = mongoose.model('User');

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
        //console.log('serializing user:',user._id);
        return done(null, user._id);
    });

    passport.deserializeUser(function(id, done) 
    {
        //console.log('deserializeUser');
        //Find user with _id
        User.findById (id, function (err, user)
        {
          if (err)
          {
            console.log('error');
            return done(err, false);
          }

          if (!user)
          {
            console.log('user not found');
            return done('user not found', false);
          }
          //return user obj to passport
          //console.log('user found!');
          return done(null, user);
        })
    
    });

    passport.use('login', new LocalStrategy(
      function(username, password, done) 
      { 

            User.findOne({'email' : username}, function(err, user){

              if (err)
              {
                console.log("db error");
                return done("db err: "+ err, false);
              }

              if (!user)
              {
                console.log("User doesn't exist in db");
                //User doesn't exist in db
                return done('user:' + username + 'NOT in db', false);
              }
              else if (!isValidPwd(user, password))
              {
                console.log('incorrect password');
                return done('user:  '+ username + 'incorrect password', false);
              }
              //Successful login
              console.log('Successfully signed in ' + user.username);
              return done(null, user);
            });
      }
    ));

    passport.use('signup', new LocalStrategy({
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
      //passport can parse 
      //username, password from a form body
      function (req, username, password, done)
      { 
          console.log("in signup");
          //console.log(req);
        // console.log('signup function callback');
          User.findOne({'username': username}, function(err, user)
          {
                if (err)
                {
                  console.log(err);
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
                  newUser.email = req.body.email;
                  newUser.location = req.body.location;
                  newUser.age = req.body.age;
                  newUser.gender = req.body.gender;

                  newUser.save(function(err, newUser)
                    {
                      if (err)
                      {
                        return (err, false);
                      }
                     
                      console.log('Successfully added user: ' + username + 'db');
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