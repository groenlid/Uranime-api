'use strict';

var appPath = process.cwd(),
	express = require('express'),
	compression = require('compression'),
    container = require('dependable').container();

module.exports = function(app) {
	
	app.use(compression({
		level: 9
	}));
	
	app.use( express.static(__dirname + '/client/config'));
	
	app.route('/').get();
	
};