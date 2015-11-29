//
// app.js
//

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var mongoose = require('mongoose'); //Object Data Mapper: mongoose enforces Schema 
var models = require('./models/models.js'); // 'var models' not used anywhere yet
var api = require('./routes/api'); //router
var authenticate = require('./routes/authenticate')(passport); //router
var session = require('express-session');
var initPassport = require('./passport-init'); //needs models.js to be loaded first
var debug = require('debug')('app');

// Initialize Passport
initPassport(passport);

//Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/whysosingle');
var User = mongoose.model('User');
var Conversation = mongoose.model('Conversation');
// var Message = mongoose.model('Message');

var app = express();
var port = 1337;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('my_secret'));
app.use(session({secret: 'our secret', 
                 saveUninitialized: true,
                 resave: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

//map routers to uri
app.use('/', api);
app.use('/auth', authenticate);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
if(app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.log('development error handler');
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err // will print stacktrace
    });
  });
} else {
  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    console.log('production error handler');
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });
}

//Passed the ExpressJS server to Socket.io. 
//In effect, our real time communication will still happen on the same port.
var io = require('socket.io').listen(app.listen(port, function()
{
  console.log('ready on port: ' + port);
}));

io.sockets.on('connection', function (socket) 
{

  console.log('socket connection event');
   
  //Load existing Conversations for logged in user
  //to message var

  socket.emit('joined_server', { message: 'welcome to the chat' });

  socket.on('join', function (data) {
    socket.join(data.username); // We are using room of socket io
    console.log("socket io room joined: " + data.username);
  });

  //socket listens for "send" event
  socket.on('send', function (data) 
  {
    var msgSenderUsername =  data.senderUsername;
    var msgReceiverUsername =  data.receiverUsername;
    var msgDate = data.date;
    var msgContent = data.content;
    
    var messageObject = {
      senderUsername: msgSenderUsername,
      receiverUsername: msgReceiverUsername,
      content: msgContent,
      date: msgDate
    };

    console.log(messageObject);

    // if(socket.handshake.headers.cookie) 
    // {
    //     console.log("Cookie found");
    //     // var cookie = cookie.parse(socket.handshake.headers.cookie);
    //     // var sessionID = parseSignedCookie(cookie['connect.sid'], 'secret');
    
    // }
    
    //TODO:
    //Limit broadcast only to person 
    //listening/receiving this particular conversation
    //io.sockets.emit('my_message', data);
    io.sockets.in(msgReceiverUsername).emit('new_message', {username: msgSenderUsername, message: msgContent, dateOfMessage: msgDate});
    io.sockets.in(msgSenderUsername).emit('new_message', {username: msgSenderUsername, message: msgContent, dateOfMessage: msgDate});

    //data.message, data.username (sender)
    // console.log("data.message: " + data.message);
    // console.log("data.username: " + data.username);

    //Create message document
    //add doc to Conversation doc's msg list
    // TODO: 
    // Retrieve receiver ID
    // var messageDoc = {
    //   senderUsername: data.username,
    //   receiverUsername: 'test1',
    //   content: data.message
    // };

    //C:\Projects\whysosingle\app_js.txt
        
    //Find Gender of Sender Profile
    

    // var msgID = messageDoc._id;
    // console.log('messageDoc::msgID: ' + msgID);

    Conversation.findOne()
                .or([{initiatorUsername: msgSenderUsername, responderUsername: msgReceiverUsername},
                     {initiatorUsername: msgReceiverUsername, responderUsername: msgSenderUsername}])
                .exec(function(err, conversation){
                  if(err){
                    console.log(err);
                  }
                  if(conversation){
                    // 
                    // ADD TO EXISTING CONVERSATION
                    // 
                    conversation.messages.push(messageObject);
                    Conversation.findOneAndUpdate({_id: conversation._id}, {$push: {messages: messageObject}}, function(err, raw){
                      if(err){
                        console.log(err);
                      }
                      if(raw){
                        console.log("updated conversation");
                      } else{
                        console.log("conversation not found!");
                      }
                    });
                  } else{
                    // 
                    // CREATE CONVERSATION
                    // 
                    console.log("conversation not found. Will create conversation if valid");
                    checkIfValidConversation(msgSenderUsername, function (){
                      var conversationDoc = new Conversation({
                        initiatorUsername: msgSenderUsername,
                        responderUsername: msgReceiverUsername,
                        messages: [messageObject]
                      });
                      conversationDoc.save(function(err, newConv){
                        if(err){
                          console.log(err);
                        }
                        console.log('Successfully added new Conv: ', newConv);
                        User.findOneAndUpdate({username: newConv.initiatorUsername}, {$push: {conversations: newConv._id}}, function(err, raw){
                          if(err){
                            console.log(err);
                          }
                          if(raw){
                            console.log("updated ", newConv.initiatorUsername);
                          } else{
                            console.log("user doesn't exist: ", newConv.initiatorUsername);
                          }
                        });
                        User.findOneAndUpdate({username: newConv.responderUsername}, {$push: {conversations: newConv._id}}, function(err, raw){
                          if(err){
                            console.log(err);
                          }
                          if(raw){
                            console.log("updated ", newConv.responderUsername);
                          } else{
                            console.log("user doesn't exist: ", newConv.responderUsername);
                          }
                        });
                      });
                    });
                  }
                });

function checkIfValidConversation(senderUsername, callback){
  var msgSenderGender;
  var convQuery;
  var senderQuery = User.findOne({ username: senderUsername});
  
  senderQuery.exec(function (err, user) {
    msgSenderGender = user.gender;
    console.log("msgSenderGender (found in db): " + msgSenderGender);
    if(msgSenderGender == "female"){
      callback();
    } else {
      console.log("gender male. Cannot start conversation");
    }
  });
}

    //   //PASS:10/22
    //   if (msgSenderGender == "male")
    //   {
    //     console.log('msgSenderGender: male');
    //     //DEBUG:
    //     //Create a Conversation, if no conversation

    //     convQuery = {initiatorUsername: msgReceiverUsername, responderUsername: msgSenderUsername};

    //     Conversation.update(convQuery, {$push: {messages: msgID}}, function (err, raw)
    //     {
    //       if (err)
    //       {
    //         console.log(err);
    //       }
    //       console.log("Mongo raw response: ", raw);
    //       console.log("Added MsgID: ", msgID);
    //     });

    //   } else //female
    //   {

    //     console.log('msgSenderGender: ' + msgSenderGender);
    //     console.log('msgReceiverUsername: ' + msgReceiverUsername);
    //     //Message:
    //     //part of Existing Conversation
    //     //or
    //     //initial messag in new Conversation 

    //     //Check existing Conversation
    //     convQuery = { initiatorUsername:msgSenderUsername,
    //                                        responderUsername: msgReceiverUsername} ;

    //     Conversation.findOne(convQuery, function (err, conv) {
    //    //No Conversation
    //       //PASS: 10/23
    //       if (!conv)
    //       {
    //         console.log('no conversationDoc: ');
    //         //Create new Conversation
    //          var conversationDoc = new Conversation ({
    //           initiatorUsername: msgSenderUsername,
    //           responderUsername: msgReceiverUsername,
    //           //TODO: 
    //           //Add new message to Conversation
    //           messages: [msgID]
    //         });
             
    //         var conversationDocID = conversationDoc._id;
    //         console.log('conversationDocID: ' + conversationDocID);

    //         conversationDoc.save(function(err, newConv)
    //         {
    //           if (err)
    //           {
    //             return (err, false);
    //           }
            
    //           console.log('Successfully added new Conv: ', newConv);
    //           // return done(null, newConv);


    //         });

    //         //Add to User: new ConversationID
    //         var userQuery = {username: msgSenderUsername};
    //         User.update(userQuery, {$push: {conversations: conversationDocID + ''}}, function (err, raw)
    //         {
    //           if (err)
    //           {
    //             console.log(err);
    //           }
    //           console.log("Mongo raw response: ", raw);
    //           console.log("Added convId: ", conversationDocID );
    //         });
    //       }
    //       else
    //       { 
    //         //add message to existing Conversation
    //         // conv.messages.add()
    //         conv.messages.push(msgID);
    //         conv.save(function(err, updateConv) 
    //         {
    //           if (err)
    //           {
    //             return (err, false);
    //           }

    //           console.log('successfully added ', msgID, 'to existing conv');
    //         });
    //       }
    //     });
    //   }
    // });
  });
});
module.exports = app;

