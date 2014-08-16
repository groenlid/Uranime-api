'use strict';

var favicon = require('static-favicon'), 
  	morgan = require('morgan'),
  	bodyParser = require('body-parser'),
    express = require('express'),
  	methodOverride = require('method-override'),
  	expressValidator = require('express-validator'),
  	config = require('./config'),
  	appPath = process.cwd(),
    compression = require('compression'),
  	errorHandler = require('errorhandler'),
    session = require('express-session'),
    mongoStore = require('mean-connect-mongo')(session),
    cookieParser = require('cookie-parser'),
    mongoose = require('mongoose'),
    grid = require('gridfs-stream'),
  	util = require('./util'),
    Agenda = require('agenda');

module.exports = function(app, passport, db){

	app.set('showStackError', config.showStackError);

	// TODO: set this to public folder
	//app.set('views', config.root + '/server/views');

  app.use(cookieParser());

  // Express/Mongo session storage
    app.use(session({
        secret: config.sessionSecret,
        store: new mongoStore({
            db: db.connection.db,
            collection: config.sessionCollection
        }),
        cookie: config.sessionCookie,
        name: config.sessionName
    }));

  // Gridfs
  var gfs = grid(db.connection.db, mongoose.mongo);
  
  app.use(function(req, res, next){
    req.gfs = gfs;
    next();
  });

	app.use(expressValidator());

  app.use(passport.initialize());
  app.use(passport.session());

	app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

	app.use(methodOverride());

  // Setting the fav icon and static folder
  app.use(favicon());

  // Agenda
  var agenda = new Agenda();
  agenda.database(config.db);

  util.walk(appPath + '/server/scheduled', null, function(path){
    require(path)(app, agenda, gfs);
  });
  
  agenda.start();

  // Skip the app/routes/middlewares directory as it is meant to be
  // used and shared by routes as further middlewares and is not a
  // route by itself
  util.walk(appPath + '/server/routes', 'middlewares', function(path) {
      require(path)(app, passport);
  });


  app.use(compression({
    level: 9
  }));
  
  app.use( express.static('../../client/config'));
  
  app.route('/').get();

  // Error handler - has to be last
  if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
      app.use(errorHandler());
  }

};