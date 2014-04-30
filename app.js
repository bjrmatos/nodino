'use strict';

// Main setup
const
  config = require('./config'),
  express = require('express'),
  path = require('path'),
  favicon = require('static-favicon'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  flash = require('express-flash'),
  httpErrors = require('./middlewares/http-errors'),
  app = express(),
  redis = require('redis').createClient(config.redis.port, config.redis.host),
  stylus = require('stylus'),
  env = app.get('env');

// Middlewares
app.use(favicon());
app.use(logger());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({secret: config.secret, key: 'session_id', cookie: {maxAge: 60000}}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use(stylus.middleware({
  src: __dirname + '/assets/stylesheets/',
  dest: __dirname + '/public/stylesheets/',

  compile: function (str, path) {
    return stylus(str)
      .set('compress', true);
  }
}));

// Views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Controllers
var mainController = require('./controllers/main')(redis);

// Routes
app.get('/', mainController.index);
app.get('/:id', mainController.show);
app.post('/', mainController.create);

// Error handlers
app.use(httpErrors.notFound);
app.use(httpErrors.error);

redis.on("error", function (err) {
  console.log("Redis error: " + err);
});

module.exports = app;
