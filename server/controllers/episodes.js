'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Anime = mongoose.model('Anime'),
    SocialEpisodeInfo = mongoose.model('SocialEpisodeInfo'),
    winston = require('winston'),
    _ = require('lodash'),
    statuses = {
        currentlyWatching: 'currentlyWatching',
        cancelWatching: 'cancelWatching',
        watched: 'watched',
        unwatched: 'unwatched'
    };

var findObjectId = function(array, needle){
    if(array === undefined || needle === undefined){
        return;
    }
    var stringyNeedle = needle.toString(),
        filter = array.filter(function(toCompare){
                return toCompare.toString() === stringyNeedle;
        });

    if(filter.length === 1)
        return filter[0];

    if(filter.length > 1)
        throw new Error('More than one element containing id: ', stringyNeedle);
};

var generateNewSocialInformation = function(episode, anime_id){
    return {
        _id: episode._id,
        anime: anime_id
    };
};

exports.episode = function(req, res, next, id){
    Anime.findOne({
            'episodes._id': id
        },{
            '_id': true,
            'episodes': true,
            'markedPrivateBy': true
        }).exec(function(err, anime) {
            if (err) return next(err);
            if (!anime) return next(new Error('No episode with the id : ' + id));
            req.anime = anime;
            req.episode = anime.episodes.filter(function(episode){
                return episode._id.toString() === id;
            })[0];
            next();
        });
};

exports.getEpisode = function(req, res) {
    var id = req.params.episodeId;
    SocialEpisodeInfo.findOne({
        _id: id
    }).exec(function(err, socialEpisodeInfo) {
        if (err) {
            res.send(500, {
                status: 500
            });
            return;
        } 
        
        var info = socialEpisodeInfo || new SocialEpisodeInfo(generateNewSocialInformation(req.episode, req.anime));
        info.removePrivateSeens(req.user);
        res.json(_.merge(info.toJSON(), req.episode.toJSON()));
    });
};

exports.updateEpisode = function(req, res){
    var socialInformation = req.body,
        markedStatus = socialInformation.status,
        client = req.get('User-Agent'),
        operation,
        query = generateNewSocialInformation(req.episode, req.anime._id),
        userid = req.user._id,
        animeIsPrivate;

    animeIsPrivate = findObjectId(req.anime.get('markedPrivateBy'), userid) !== undefined;

    switch(markedStatus){
        case statuses.cancelWatching:
            operation = { $pull: { currentlyWatching: { user: userid } } };
            break;
        case statuses.currentlyWatching:
            operation = { $push: { currentlyWatching: { user: userid, client: client, private: animeIsPrivate } } };
            break;
        case statuses.unwatched:
            operation = { $pull: { watched: { user: userid } } };
            break;
        case statuses.watched:
            operation = { $push: { watched: { user: userid, client: client, private: animeIsPrivate } } };
            break;
    }

    SocialEpisodeInfo.findOneAndUpdate(query, operation, {safe: true, upsert: true}, function(err, modified){
        if (err) {
            winston.error('Error updating watched status: ', err);
            res.send(500, {
                status: 500
            });
            return; 
        } 
        
        modified.removePrivateSeens(req.user);

        res.json(modified);
    });
};