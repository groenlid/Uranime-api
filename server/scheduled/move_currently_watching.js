'use strict';

var mongoose = require('mongoose'),
    Anime = mongoose.model('Anime'),
    _ = require('lodash'),
    bluebird = require('bluebird'),
    SocialEpisodeInfo = mongoose.model('SocialEpisodeInfo');

module.exports = function(app, agenda) {

    var scheduledName = 'community: mark episode as watched';

    agenda.define(scheduledName, function(job, done) {

        SocialEpisodeInfo.currentlyWatching(function(err, socialEpisodes){
            var animeIds;
            if(err){
                done(err);
                return;
            }

            if(socialEpisodes.length === 0){
                done();
                return;
            }

            animeIds = _.pluck(socialEpisodes, 'anime');

            Anime.find({_id: {$in: animeIds}}, { episodes:true }, function(err, anime) {
                var toMove = [],
                    pending = [];

                socialEpisodes.forEach(function(socialEpisode){
                    var associatedAnime = _.find(anime, {_id: socialEpisode.get('anime')}),
                        associatedEpisode = _.find(associatedAnime.episodes, {_id: socialEpisode.get('_id')}),
                        p = bluebird.pending();

                    socialEpisode.currentlyWatching.forEach(function(currentlyWatching){
                        if(currentlyWatching.markedDate === undefined){
                            return;
                        }

                        if(currentlyWatching.markedDate.getTime() + (associatedEpisode.runtime * 60 * 1000 ) > new Date().getTime()){
                            console.log('currentlyWatching.markedDate + runtime is greater than now');
                            return;
                        }

                        console.log('adding currentlywatching');
                        toMove.push(currentlyWatching);
                    });

                    SocialEpisodeInfo.update({_id: socialEpisode._id }, { $pullAll: { currentlyWatching: toMove }, $push: {watched: { $each: toMove } } }, function(err){
                        if(err) {
                            p.reject(err);
                        } else {
                            p.resolve();
                        }
                    });
                    
                    pending.push(p);

                });
                bluebird.all(pending).then(function(){
                    done();
                });
            });
        });
    });

    //agenda.now(scheduledName);
    agenda.every('5 minutes', scheduledName);
};