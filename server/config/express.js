'use strict';

var favicon = require('static-favicon'), 
  	morgan = require('morgan'),
  	bodyParser = require('body-parser'),
  	methodOverride = require('method-override'),
  	expressValidator = require('express-validator'),
  	config = require('./config'),
  	appPath = process.cwd(),
    compression = require('compression'),
  	errorHandler = require('errorhandler'),
    cookieParser = require('cookie-parser'),
    mongoose = require('mongoose'),
    grid = require('gridfs-stream'),
  	util = require('./util'),
    setupAgenda = require('./agenda'),
    expressJwt = require('express-jwt'),
    authorization = require('../routes/middlewares/authorization');

module.exports = function(app, passport, db){

	app.set('showStackError', config.showStackError);

  app.use(cookieParser());

  // Gridfs
  var gfs = grid(db.connection.db, mongoose.mongo);
  mongoose.gfs = gfs;

  app.use(expressValidator());

  app.use(passport.initialize());
  app.use(expressJwt({
    secret: config.tokenSecret,
    userProperty: config.tokenPath,
    credentialsRequired: false
  }));
  app.use(authorization.fetchUserObjectFromToken);

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

	app.use(methodOverride());

  // Setting the fav icon and static folder
  app.use(favicon());
  
  setupAgenda(app, appPath, gfs);

  // Skip the app/routes/middlewares directory as it is meant to be
  // used and shared by routes as further middlewares and is not a
  // route by itself
  util.walk(appPath + '/server/routes', 'middlewares', function(path) {
      require(path)(app, passport);
  });

  app.use(compression({
    level: 9
  }));
  
  app.route('/').get();

  // Error handler - has to be last
  if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
      app.use(errorHandler());
  }

};