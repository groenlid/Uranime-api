'use strict';

var config = require('../config/config'),
    anidb = require('anidb');

module.exports = function(app, agenda) {

    var scheduledName = 'anidb: update anime';

    agenda.define(scheduledName, {concurrency: 1} ,function(job, done) {

        var adb = new anidb(config.anidb.client, config.anidb.clientVersion);
        
        adb.getAnime(6671, function(err, anime){
            console.log(err,anime);
            done();       
        });
    });

    //agenda.now(scheduledName);
    agenda.every('1 day', scheduledName);

};