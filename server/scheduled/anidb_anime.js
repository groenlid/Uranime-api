'use strict';

var config = require('../config/config'),
    anidb = require('anidb'),
    mongoose = require('mongoose'),
    Anime = mongoose.model('Anime'),
    bluebird = require('bluebird');

module.exports = function(app, agenda) {

    var scheduledName = 'anidb: update anime';


    agenda.define(scheduledName, {concurrency: 1} ,function(job, done) {
        var id = job.attrs.data.anime, anime, adb;
        
        adb = new anidb(config.anidb.client, config.anidb.clientVersion);

        anime = Anime.findOne({
            _id: id
        }).exec();

        anime
        .then(function(dbAnime){
            return new bluebird(function(resolve, reject){

            });
            //return bluebird.promisify(adb.getAnime, dbAnime.);
        })
        .then(done)
        .error(function(error){
            job.fail(error);
        });
        /*
        
        adb.getAnime(6671, function(err, anime){
            console.log(err, anime);
        });*/
    });

    //agenda.now(scheduledName, { anime: '53ef85125258bb45d8d3e44d' });
    //agenda.every('1 day', scheduledName);
    //agenda.every('5 minutes', scheduledName);

};