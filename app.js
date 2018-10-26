var bodyParser   = require('body-parser');
var createError = require('http-errors');
var cors = require('cors');
var express = require('express');
var path = require('path');
var logger = require('morgan');

// Sets up an express app for production use (SSL and CORS options)
function useProduction(expressApp) {
  // force https
  expressApp.use(function(req, res, next) {
    var protocol = req.get('x-forwarded-proto');
    protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
  });

  // Configure CORS preflight options
  expressApp.options('*', cors({
    origin: true,
    methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin'],
    preflightContinue: false,
  }));
}

//===========================================================/
// USER APPLICATION API
//===========================================================/

var app = express();

const PROD = app.get('env') === 'production'; // env determination

// load passport for user authentication
require('./config/passport');

// Use middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

if (PROD) useProduction(app);

// Use routes
app.use('/', require('./routes'));

// Catch 404 (no route) and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Catch all formatter for error responses
app.use(function(err, req, res, next) {
  // set locals, only providing error stack in development/test
  res.locals.message = err.message;
  res.locals.error = PROD ? {} : err.stack;

  // return the error
  res.status(err.status || 500);
  res.json({'errors': {
    message: res.locals.message,
    error: res.locals.error
  }});
});

//===========================================================/
// EDGE DEVICE API
//===========================================================/

var edgeApp = express();

// Use middleware
edgeApp.use(logger('dev'));
edgeApp.use(bodyParser.json());
edgeApp.use(bodyParser.urlencoded({ extended: true }));
edgeApp.use(cors());

if (PROD) useProduction(edgeApp);

// Use routes
edgeApp.use('/', require('./edge_routes'));

// Catch 404 (no route) and forward to error handler
edgeApp.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Catch all formatter for error responses
edgeApp.use(function(err, req, res, next) {
  // set locals, only providing error stack in development/test
  res.locals.message = err.message;
  res.locals.error = PROD ? {} : err.stack;

  // return the error
  res.status(err.status || 500);
  res.json({'errors': {
    message: res.locals.message,
    error: res.locals.error
  }});
});

module.exports = { app, edgeApp };
