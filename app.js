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
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(session({secret: 'our secret', 
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

app.post('/signup', function(req, res) {
    console.log('received post: ' + String(req.body.location));
    var postedProfileForm = req.body;
    var meetsCriteria = CheckProfileForm(postedProfileForm);
    if(meetsCriteria){
      res.send('It worked!');
    }
    else {
      res.send('Invalid form');
    }
});

function CheckProfileForm(form) {
  // This function should check the database to see if a user already exists and also if the form contains enough information and return true if it's valid
  return false;
}

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
