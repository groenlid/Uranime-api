'use strict';

var Agenda = require('agenda'),
	util = require('./util'),
	config = require('./config');

module.exports = function(app, appPath, gfs){
  if ('test' === app.get('env')) {
    return;
  }
  
  // Agenda
  var agenda = new Agenda();
  agenda.database(config.db);

  agenda.on('start', function(job) {
    console.log('Job %s starting', job.attrs.name);
  });

  agenda.on('complete', function(job) {
    console.log('Job %s finished', job.attrs.name);
  });

  util.walk(appPath + '/server/scheduled', null, function(path){
    require(path)(app, agenda, gfs);
  });
  
  agenda.start();
};