'use strict';

var favicon = require('static-favicon'), 
  	morgan = require('morgan'),
  	bodyParser = require('body-parser'),
  	methodOverride = require('method-override'),
  	expressValidator = require('express-validator'),
  	config = require('./config'),
  	appPath = process.cwd(),
  	errorHandler = require('errorhandler'),
  	util = require('./util');

module.exports = function(app, passport, db){

	app.set('showStackError', config.showStackError);

	// TODO: set this to public folder
	//app.set('views', config.root + '/server/views');

	app.use(expressValidator());
	app.use(bodyParser());
	app.use(methodOverride());

    // Setting the fav icon and static folder
    app.use(favicon());

	// Skip the app/routes/middlewares directory as it is meant to be
	// used and shared by routes as further middlewares and is not a
	// route by itself
	util.walk(appPath + '/server/routes', 'middlewares', function(path) {
	    require(path)(app, passport);
	});

    // Error handler - has to be last
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
        app.use(errorHandler());
    }

};