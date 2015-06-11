var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');


//routers:
var api = require('./routes/api');
var authenticate = require('./routes/authenticate')(passport);


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//middleware:
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(session({secret: '<mysecret>', 
                 saveUninitialized: true,
                 resave: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

//map routers to uri
app.use('/', api);
app.use('/auth', authenticate);

app.post('/search', function(req, res) {
    console.log('received post: ' + String(req.body.location));
    //res.send('POST request to homepage');
  //   res.json([
  //   { id: "1", username: "BobbyBoy", image_src: "http://24.media.tumblr.com/tumblr_m3fqbmn8cF1qe4cuxo1_500.jpg", points: "628", detail: "I live by myself, I pay my own rent, I wear socks that match and I love my mom. I am a confident, attractive & comedic person. I do stunt work. Have you ever seen it in a movie when a hot actor has to reveal his naked ass? That’s my job. Oh, and I’m in the fitness biz, as well as back in school finishing up my pre-med reqs." },
  //   { id: "2", username: "some_guy", image_src: "http://25.media.tumblr.com/tumblr_m3d737UrjX1rurzxho1_400.jpg", points: "2043", detail: "Basically I love life and I love living life. I enjoy the outdoors, traveling, restaurants, laughing, goIng to cultural events, and sociaLizing with quality peOple. Its just better liVing and sharing lifE with someone else"},
  //   { id: "3", username: "ns_3225", image_src: "https://s-media-cache-ak0.pinimg.com/236x/9b/13/83/9b13836f4523e4fb332aa588b3ba1cf1.jpg", points: "105", detail: "64% Introvert, 36% Extrovert. Analytical, kinesthetic thinker. The spotlight is not my friend. Anti-planner, pro spontaneity. A shy geek and a smooth operator…. that’s approximately me." },
  //   { id: "4", username: "THEONEANDONLY", image_src: "https://s-media-cache-ak0.pinimg.com/236x/5c/3c/fa/5c3cfadac848470ae8f00c0b1e2aa4ae.jpg", points: "4123", detail: "Hey :)" },
  //   { id: "5", username: "goals23", image_src: "http://regent.blogs.com/photos/uncategorized/2008/12/23/83494618.jpg", points: "1408", detail: "I'm new in town. Looking for new friends." }
  // ]);
    res.send('It worked!');
    //var location = req.body.location;
    //res.send('got a POST request');
    //res.redirect(307, '/browse');
    // request({ url: '/browse', headers: req.headers, body: req.body }, function(err, remoteResponse, remoteBody) {
    //     if (err) { return res.status(500).end('Error'); }
    //     //res.writeHead(remoteResponse); // copy all headers from remoteResponse
    //     res.end(remoteBody);
    // });
    //res.redirect('browse');
    // ...
});

//Implement a webserver to Listen to web requests on a port
//Render views,...

//Define routes (paths, handlers) on server

//Routing refers to the definition of 
//end points (URIs) to an application and how it responds to client requests.
// app.get('/', function(req, res)
// {
//   //render('views/[view filename]', [locals], [callback func])
  
//   //locals: object whose properties define local variables for the view
//   //pass 'local' variables/data to view 

//   res.render('index', { title: 'Express', name: 'Jerry', supplies:['broom', 'mop', 'dustpan']});
// });


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// app.get('/search', function(req, res, next) {
//   console.log("entered GET for /search");
//   if (req.param('location')) {
//     console.log("Location: " + req.query.location);
//   };
//   next();
// });

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

//function() is invoked when request 
//is received in at specified port
app.listen(1337, function()
{
  console.log('ready on port 1337');
});
