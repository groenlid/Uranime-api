'use strict';

/**
 * Module dependencies.
 */

var express = require('express'),
	mongoose = require('mongoose'),
    passport = require('passport'),
    util    = require('util');

/**
 * Database and authorization setup.
 */
var config = require('./server/config/config');

var db = mongoose.connect(config.db);

var app = express();

require('./server/config/bootstrap')(app, passport, db);

app.listen(config.port, config.hostname, function(){
  console.log(util.format('Listening on port %s on host %s', config.port, config.hostname));
});

// init logger here

exports = module.exports = app;