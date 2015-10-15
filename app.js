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
var Conversation = mongoose.model('Conversation');

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

   console.log('socket connection');
   
   //Register custom event:"my_message"

    socket.emit('my_message', { message: 'welcome to the chat' });

    //socket listens for "send" event
    socket.on('send', function (data) 
    {

    //TODO:
    //Limit broadcast only to person 
    //listening/receiving this particular conversation

    //CHANGE:
    //Broadcast user sent data to ALL other sockets listening
    io.sockets.emit('my_message', data);
  
    //data.message, data.username (sender)
    console.log("data.message: " + data.message);
    console.log("data.username: " + data.username);

    
    // if(socket.handshake.headers.cookie) 
    // {
    //     console.log("Cookie found");
    //     // var cookie = cookie.parse(socket.handshake.headers.cookie);
    //     // var sessionID = parseSignedCookie(cookie['connect.sid'], 'secret');
    
    // }
    

    var Conversation = mongoose.model('Conversation');
 
    // Conversation.find( function (err, conversations) {
    //     if (err) return console.error(err);
    //     console.log(conversations);
    // })
    //TODO:
    //Need initiator and responder IDs or Strings

    //Retrieve the Coversation (1 only) for this user with this receiver
    // var query = Conversation.findOne({ 'initiator': '', 'responder' : ''});

    // query.exec(function (err, conv) {
    //     if (err) return handleError(err);
    //     if (conv == null)
    //     {

    //       //Create new conversation 
    //       var newConv = new Conversation();
    //       //Need responder and initiator usernames
    //       newConv.responder = "";
    //       newConv.initiator = "";
    //       console.log('Adding a new Conversation w/ new Message');
    //       // newConv.save(function(err, newConv)
    //       // {
    //       //   if (err)
    //       //   {
    //       //     return (err, false);
    //       //   }
           
    //       //   console.log('Successfully added new Conv: ');
    //       //   return done(null, newUser);
    //       // });
         
    //     }
    //     else
    //     {
    //       //Add new message(s) to existing conversation
    //       console.log('Adding new msg to exisiting Conversation');
    //       //Conversation.add()
    //     }

    //   })

    });
});
module.exports = app;

