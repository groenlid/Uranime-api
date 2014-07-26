'use strict';

/**
 * Module dependencies.
 */

var express = require('express'),
	mongoose = require('mongoose'),
    passport = require('passport'),
    https   = require('https'),
    fs      = require('fs'),
    util    = require('util');

/**
 * Database and authorization setup.
 */
var config = require('./server/config/config');

var db = mongoose.connect(config.db);

var app = express();

require('./server/config/bootstrap')(app, passport, db);

var options = {
  key: fs.readFileSync(config.ssl.key),
  cert: fs.readFileSync(config.ssl.cert)
};

https.createServer(options, app).listen(config.port, config.hostname, function(){
  console.log(util.format('Listening on port %s on host %s', config.port, config.hostname));
});

// init logger here

exports = module.exports = app;