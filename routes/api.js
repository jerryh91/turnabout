// GET loadConversations
//   return [{contactUsername: String, lastMessage: String, dateOfMessage: String (it will be of the form Date.toJSON())}]
// GET loadConversation/:username
//   return [{username: String, message: String, dateOfMessage: String}]
// POST sendmessage
//   send JSON -> {senderUsername: String, receiverUsername: String, content: String}


var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: 'uploads/'});
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Conversation = mongoose.model('Conversation');
var fs = require('fs');
var Grid = require('gridfs-stream')

var survey = 
[ {question: "Would you be willing to pay for personal advice on how to improve your relationship skills?", answers: ["Yes", "No"]},
  {question: "How many dating sites have you used in the past?",
   answers: ["None", "1", "2", "More than 2"]},
  {question: "What is your opinion on dating sites?",
   answers: ["They are a great tool", "They're a waste of time because they don't work", "I'm too embarrassed to use them", "I don't feel the need for them"]} 
];

var filteredProfiles = [
    { id: "1", username: "BobbyBoy", image_src: "http://24.media.tumblr.com/tumblr_m3fqbmn8cF1qe4cuxo1_500.jpg", points: "628", detail: "I live by myself, I pay my own rent, I wear socks that match and I love my mom. I am a confident, attractive & comedic person. I do stunt work. Have you ever seen it in a movie when a hot actor has to reveal his naked ass? That’s my job. Oh, and I’m in the fitness biz, as well as back in school finishing up my pre-med reqs." },
    { id: "2", username: "some_guy", image_src: "http://25.media.tumblr.com/tumblr_m3d737UrjX1rurzxho1_400.jpg", points: "2043", detail: "Basically I love life and I love living life. I enjoy the outdoors, traveling, restaurants, laughing, goIng to cultural events, and sociaLizing with quality peOple. Its just better liVing and sharing lifE with someone else"},
    { id: "3", username: "ns_3225", image_src: "https://s-media-cache-ak0.pinimg.com/236x/9b/13/83/9b13836f4523e4fb332aa588b3ba1cf1.jpg", points: "105", detail: "64% Introvert, 36% Extrovert. Analytical, kinesthetic thinker. The spotlight is not my friend. Anti-planner, pro spontaneity. A shy geek and a smooth operator…. that’s approximately me." },
    { id: "4", username: "THEONEANDONLY", image_src: "https://s-media-cache-ak0.pinimg.com/236x/5c/3c/fa/5c3cfadac848470ae8f00c0b1e2aa4ae.jpg", points: "4123", detail: "Hey :)" },
    { id: "5", username: "goals23", image_src: "http://regent.blogs.com/photos/uncategorized/2008/12/23/83494618.jpg", points: "1408", detail: "I'm new in town. Looking for new friends." }
  ];

var gfs;
var conn = mongoose.connection;
Grid.mongo = mongoose.mongo;
conn.once('open', function() {
  console.log('mongoose connection open');
  gfs = Grid(conn.db);
});

// router.route('/like/:likedusername')
// .post(function(req, res) {
//   var likeduser = req.params.likedusername;
//   console.log("api: likedusername: ", likeduser);
//   User.findOne({'username': likeduser}, function(err, user)
//     {
//       if (err)
//       {
//         console.log(err);
//         //return done(err, false);
//       }
      
//       if (user)
//       {
//         User.update(
//       }
//     }

// });

router.post('/upload/photo', isAuthenticated, upload.single('profilePic'), function(req, res, next){
  //multer handles multipart/form-data so we just need to grab req.file
  var writestream = gfs.createWriteStream({
    filename: req.file.name,
    mode:'w',
    content_type: req.file.mimetype,
    metadata: req.body,
  });
  fs.createReadStream(req.file.path).pipe(writestream);
  var username = req.user.username;
  writestream.on('close', function (file) {
    User.findOne({'username': username}, function(err, user)
    {
      if (err)
      {
        console.log(err);
        //return done(err, false);
      }
      
      if (user)
      {
        console.log('User found to add photo ID');
        // use + '' to get the string output from ObjectId(...)
        console.log(file._id + '');
        User.update(
          { "username" : username}, 
          //{$push: {"photos" : {photoID: file._id + ''}}}, 
          {"photos" : [{photoID: file._id + ''}]}, 
          function(err, results) {
            if (err)
            {
              console.log(err);
              return (err, false);
            }
            console.log('Successfully added photoID to user. Results are: ' + results);
            //return done(null, user);
          });
      } else
      {
        console.log('user does not exist');
        //return done('user:' + username + 'not in DB', false);
      }
          
    });

    res.send("Success!");
    fs.unlink(req.file.path, function (err) {
      if (err) console.error("Error: " + err);
      console.log('successfully deleted : '+ req.file.path );
    });
  });
}); 

router.post('/profile/update', isAuthenticated, function(req, res, next){
  var username = req.user.username;
  var updatedProfile = req.body;
  User.findOneAndUpdate({'username': username}, updatedProfile, function(err, user)
  {
    if (err)
    {
      console.log(err);
      //return done(err, false);
    }
    
    if (user)
    {
      console.log('Successfully updated profile for ' + user.username);
    } else
    {
      console.log('user does not exist');
      //return done('user:' + username + 'not in DB', false);
    }
  });
  res.send("Success!");
});

router.get('/profile/:id', isAuthenticated, function(req, res) {
  var username = req.params.id;
  User.findOne({'username': username}, function(err, user)
  {
    if (err)
    {
      console.log(err);
      //return done(err, false);
    }
    
    if (user)
    {
      var path = "#/profile/" + username;
      // CHECK IF THE VIEWED PROFILE IS THE SAME PERSON THAT IS LOGGED IN 
      var editable = user.username == req.user.username;
      if(hasProfilePicture(user)){
        getProfilePicture(user, function(imgpath){
          res.render('profile', {title: 'express', imageLink: imgpath, goNowherePath: path, editable: editable});
        });
      } else {
        res.render('profile', {title: 'express', imageLink: 'images/default.png', goNowherePath: path, editable: editable});
      }
    } else
    {
      console.log('user does not exist');
      //return done('user:' + username + 'not in DB', false);
    }
        
  });
});

function hasProfilePicture(user){
  return user.photos[0] ? true : false;
}

function getProfilePicture(user, callback){
  
  // Has profile picture?
  var pictureObject = user.photos[0];
  var pictureId = pictureObject.photoID;
  var imgpath = 'temporaryimgs/' + pictureId + '.jpg';
  var readstream = gfs.createReadStream({
    _id: pictureId
  });
  // THIS PUSHES RAW BINARY TO CLIENT; DON'T KNOW HOW TO CONVERT TO IMAGE YET
  // readstream.pipe(res);
  var writestream = fs.createWriteStream('public/' + imgpath);
  readstream.pipe(writestream);
  writestream.on('close', function(file){
    callback(imgpath);
    // DON'T DELETE FILE BEFORE THE CLIENT GETS IT
    // fs.unlink('public/' + imgpath, function(err){
    //   if (err) {
    //     console.error("Error: " + err);
    //   } else {
    //     console.log('successfully deleted : ' + 'public/' + imgpath);
    //   }
    //});
  });
  //Experiment to send raw binary to client (didn't work)  
  //res.writeHead(200, {'Content-Type': 'image/jpeg'});
  //res.write(data, 'binary');
}

router.route('/')
.get(function(req, res) {
    //Query from MongoDB
    res.render('index', {title: 'title'});
});

router.route('/home')
.get(function(req, res) {             
    //Query from MongoDB
    res.render('home', {message: 'My message'});
});

router.route('/about')
.get(function(req, res) {
    //Query from MongoDB
    res.render('about', {message: 'My message'});
});

//Messages List View
router.route('/messages')
.get(isAuthenticated, function(req, res) {

    //Add msgs to Db
    res.render('message_pg');
});

router.route('/login')
.get(function(req, res){
    res.render('login');
});

router.route('/browse')
.get(isAuthenticated, function(req, res) {
    //Query from MongoDB
    res.render('browse', {title: 'express'});
});

router.route('/blog')
.get(function(req, res) {
    res.render('blog', {title: 'express'});
});

router.route('/search')
.get(isAuthenticated, function(req, res) {
    if (req.query.location) {
        // PUT SEARCH LOGIC HERE
        res.json(filteredProfiles);
    } else {
        res.render('search', {title: 'express'});
    }
});

router.route('/createProfile')
.get(function(req, res) {
    res.render('createProfile', {title: 'Sign Up!'});
});

router.route('/getSurvey')
.get(function(req, res) {
    res.json(survey);
});

router.route('/loadConversations')
.get(isAuthenticated, function(req, res) {
  
  var result = [];
  //Find Conversation with each and all distinct users
  for(var i = 0; i < req.user.conversations.length; i++){
    
    Conversation.findOne({'_id': req.user.conversations[i]}, function(err, conversation){
      if(err){
        console.log(err);
      }
      if(conversation){
        var contactUsername = (conversation.initiatorUsername == req.user.username) ? conversation.responderUsername : conversation.initiatorUsername;
        var lastMessage = conversation.messages[conversation.messages.length-1].content;
        var dateOfMessage = conversation.messages[conversation.messages.length-1].date;
        var convID = conversation._id;
        //PASS
        console.log("/loadConversations: convID: ", convID);
        var resultJSON = {contactUsername: contactUsername,
                          lastMessage: lastMessage,
                          dateOfMessage: dateOfMessage,
                          convID: convID};

        result.push(resultJSON);
        console.log("/loadconversations: adding to conversation to result[] ");
      
      } else {
        console.log("conversation not found!");
      }
      if(result.length == req.user.conversations.length){
        console.log("/loadconversations: return conversation result[]")
        res.json(result);
      }

      });

    
  }
});

router.route('/loadConversation/:username')
.get(isAuthenticated, function(req, res){
  //look for conversation
  Conversation.findOne({'initiatorUsername': req.user.username, 'responderUsername': req.params.username}, function(err, conversation){
    if(err){
      console.log(err);
    }
    if(conversation){
      res.json(grabConversation(conversation));
    } else {
      //look again, but swap the initiator and responder username
      // TODO: make this better. Maybe an array of usernames is better?
      Conversation.findOne({'initiatorUsername': req.params.username, 'responderUsername': req.user.username}, function(err, conversation2){
        if(err){
          console.log(err);
        }
        if(conversation2){
          res.json(grabConversation(conversation2));
        } else {
          console.log("conversation not found!");
        }
      });
    };  
  });
});

function grabConversation(conversation){
  var result = [];
  for(var i = 0; i < conversation.messages.length; i++){
    var username = conversation.messages[i].senderUsername;
    var message = conversation.messages[i].content;
    var dateOfMessage = conversation.messages[i].date;
    var convID = conversation._id;
    convID = convID.str;
    var messageJSON = {username: username,
                       message: message,
                       dateOfMessage: dateOfMessage,
                       convID: convID};
    
    result.push(messageJSON);
  }
  return result;
}

// //Load all messages for a given conversations
// router.router('/messages/:conversationID')
// .get(isAuthenticated, function(req, res)
// {
//    Conversation.findOne({"_id" : ObjectId(req.params.conversationID)}, function(err, conv){
//       if(err){
//             console.log(err);
//             return;
//         }
//         if(conv){
//    });


// });

//TODO:
//Message List View:
//Load all messages from oldest to newest for 1 given conversation
router.route('/messages/:conversationID')
.get(isAuthenticated, function(req, res) {
    console.log("/messages/: conversationID: ", req.params.conversationID);

    //Alternate Method 1:
    //Use Other Username (the user conversing with this user)
    //to query all messages in this conversation

    //Need to know who's initiator and who's responder 

    Conversation.findOne({'_id': req.params.conversationID}, function(err, conv)
    {
        if(err){
            console.log(err);
            return;
        }
        if(conv)
        {
            if(conv.messages)
            {
                var foundMessages = [];
                for(var i = 0; i < conv.messages.length; i++)
                {   
                    foundMessages.push(conv.messages[i]);
                        
                    if(foundMessages.length == conv.messages.length)
                    {
                      //QUESTION:
                      //If not part of $HTTP request from AngularJS controller,
                      //How to retrieve response data in main-controller.js?
                      res.json(foundMessages);
                    }
                }
              }
        }
        else
        {
            console.log("Conversation: ", req.params.conversationID, " not found");
            return;
        }
    });
});

router.route('/getprofileinfo/:id')
.get(isAuthenticated, function(req, res) {

        var profileID = req.params.id;

        User.findOne({'username': profileID}, function(err, user){
            if(err){
                console.log(err);
                return;
            }
            if(user){
                // console.log("User found: " + profileID);
                //TO DO: don't return all user data
                res.json(user);
            } else{
                console.log("User does not exist");
                return;
            }
        });

        //Query profileID from MongoDB
        // res.json(filteredProfiles[0]);
});

function isAuthenticated(req, res, next) {

  // do any checks you want to in here

  // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
  // you can do this however you want with whatever variables you set up

  if(!req.user){
    // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
    console.log("user is not authenticated");
    // res.redirect('/');
    // res.render('login');
    // send not authorized status. Angular code should redirect to login
    res.sendStatus(401);
  }
  else{
    console.log("user is authenticated");
    return next();
  }
}

//.put: update existing profile with id
// .put(function(req, res) {

//      var profileID = req.params.id;
//      //Query profileID from MongoDB
//      res.send({message: 'Update profile: ' + profileID});

// })

// .delete(function(req, res) {

//      var profileID = req.params.id;
//      //delete profileID from MongoDB
//      res.send({message: 'Delete profile: ' + profileID});

//});

module.exports = router;