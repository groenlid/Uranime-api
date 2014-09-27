'use strict';

var anidbProvider = require('../providers/anidbProvider'),
    mongoose = require('mongoose'),
    Anime = mongoose.model('Anime'),
    anidb = require('anidb'),
    config = require('../config/config'),
    bluebird = require('bluebird'),
    thetvdbProvider = require('../providers/thetvdbProvider');

module.exports = function(app, agenda) {
    var client = new anidb(config.anidb.client, config.anidb.clientVersion, 3000);
    var scheduledName = 'anidb: update anime';

    function fetchAndUpdateAnime(job, done, ids){
        if(ids.length === 0)
            return done();

        var id = ids.shift();
        Anime.findOne({_id: id}, function(err, anime){
            if(err) {
                // Should probably log something here...
                return fetchAndUpdateAnime(job, done, ids);
            }

            var anidb = new anidbProvider(anime, client)
            .refreshRemote()
            .updateEpisodes()
            .returnAnime();

            var thetvdb = new thetvdbProvider(anime)
            .refreshRemote()
            .updateEpisodes()
            .returnAnime();

            bluebird.settle([anidb, thetvdb]).then(function(){
                anime.save();
                fetchAndUpdateAnime(job, done, ids);
            });
        });
    }

    agenda.define(scheduledName, {concurrency: 1} ,function(job, done) {
        Anime.find({status: {$ne: 'finished'}}, {_id: true}, function(err, ids){
            if(err){
                return job.fail(err);
            }
            return fetchAndUpdateAnime(job, done, ids);
        });

    });

    //agenda.now(scheduledName, { anime: '53ef85125258bb45d8d3e44d' });
    agenda.every('1 day', scheduledName);
    //agenda.every('5 minutes', scheduledName);
    //agenda.now(scheduledName);

};