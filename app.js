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
var api = require('./routes/api'); //router
var mongoose = require('mongoose'); //Object Data Mapper: mongoose enforces Schema 
var models = require('./models/models.js'); // 'var models' not used anywhere yet
var authenticate = require('./routes/authenticate')(passport); //router
var session = require('express-session');
var initPassport = require('./passport-init'); //needs models.js to be loaded first

// Initialize Passport
initPassport(passport);

//Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/whysosingle');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//middleware:
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

module.exports = app;

//function() is invoked when request 
//is received in at specified port
app.listen(1337, function()
{
  console.log('ready on port 1337');
});