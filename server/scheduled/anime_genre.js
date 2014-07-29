'use strict';

var config = require('../config/config'),
    anidb = require('anidb'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    Genre = mongoose.model('Genre'),
    bluebird = require('bluebird');

module.exports = function(app, agenda) {

    var scheduledName = 'anidb: fetch new genres';

    agenda.define(scheduledName, function(job, done) {

        var adb = new anidb(config.anidb.client, config.anidb.clientVersion);
        
        adb.getGenres(function(err, categorylist){
            
            var categoryIdMap = {},
                deferreds = [];

            _.forEach(categorylist, function(genre){
                categoryIdMap[genre.id] = genre.name;
            });

            _.forEach(categorylist, function(genre){
                var deferred = bluebird.pending();
                
                deferreds.push(deferred);

                Genre.findByIdAndUpdate(genre.id, 
                    { description: genre.description, is_hentai: genre.ishentai, parentGenre: categoryIdMap[genre.parentid] }, 
                    { upsert: true }, 
                    function( savedGenre ){
                        deferred.resolve();
                    });

            });

            bluebird.all(deferreds).then(function(){
                console.log(scheduledName + ' - Finished');
                done();
            });
    
        });
    });

    agenda.now(scheduledName);
    agenda.every('1 weeks', scheduledName);

};