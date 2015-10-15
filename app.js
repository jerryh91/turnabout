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
var multer = require('multer');
var upload = multer({ dest: 'uploads/'});
var User = mongoose.model('User');
 
// Initialize Passport
initPassport(passport);

//Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/whysosingle');
var conn = mongoose.connection;
var fs = require('fs');
var Grid = require('gridfs-stream')
Grid.mongo = mongoose.mongo;
var gfs;

var Conversation = mongoose.model('Conversation');

conn.once('open', function() {
  console.log('mongoose connection open');
  gfs = Grid(conn.db);
  });

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


app.post('/upload/photo', upload.single('profilePic'), function(req, res, next){
    //multer handles multipart/form-data so we just need to grab req.file
    uploadImg(req, res);
});

app.get('/profile/:id', function(req, res) {
  // Has profile picture?
  var pictureObject = req.user.photos[0];
  if(pictureObject){
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
      res.render('profile', {title: 'express', imageLink: imgpath});
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

  } else {
    res.render('profile', {title: 'express', imageLink: 'images/default.png'});
  }


});

var uploadImg = function(req,res) {
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
};

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
    
  var conversationDoc = new Conversation({conversationID: 'testID',
    initiator: 'initiatorID2',
    responder: 'responderID2',
    });

   //console.log(conversationDoc.initiator);

   //saving conversationDoc (document) to DB
   conversationDoc.save(function (err, conversationDoc) 
   {
      console.log("conversationDoc save");
      if (err) 
      {
        console.log("DB Save err");
        return console.error(err);

      }
    })

    Conversation.find( function (err, conversations) {
        if (err) return console.error(err);
        console.log(conversations);
    })

     Conversation.findOne({ 'initiator': 'initiatorID2'});

    //TODO:
    //Need initiator and responder IDs or Strings

    //Retrieve the Coversation (1 only) for this user with this receiver
    var query = Conversation.findOne({ 'initiator': '', 'responder' : ''});

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

