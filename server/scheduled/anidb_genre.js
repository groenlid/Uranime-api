'use strict';

var config = require('../config/config'),
    anidb = require('anidb'),
    mongoose = require('mongoose'),
    Genre = mongoose.model('Genre'),
    bluebird = require('bluebird');

module.exports = function(app, agenda) {

    var scheduledName = 'anidb: fetch new genres';

    agenda.define(scheduledName, function(job, done) {
        var adb = new anidb(config.anidb.client, config.anidb.clientVersion);
        
        adb.getGenres(function(err, categorylist){
            if(err) return job.fail(err);

            var categoryIdMap = {},
                deferreds = [];

            categorylist.forEach(function(genre){
                categoryIdMap[genre.id] = genre.name;
            });

            categorylist.forEach(function(genre){
                var deferred = bluebird.pending();
                
                deferreds.push(deferred);

                Genre.findByIdAndUpdate(genre.name, 
                    { description: genre.description, is_hentai: genre.ishentai, parentGenre: categoryIdMap[genre.parentid] }, 
                    { upsert: true }, 
                    function( savedGenre ){
                        deferred.resolve();
                    });
            });

            bluebird.all(deferreds).then(function(){
                done();
            });
    
        });
    });

    //agenda.now(scheduledName);
    agenda.every('1 weeks', scheduledName);

};