'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Anime = mongoose.model('Anime'),
    bluebird = require('bluebird'),
    config = require('../config/config'),
    util = require('util'),
    _ = require('lodash');

/**
 * Show an article
 */
exports.show = function(req, res) {
    res.json(req.anime);
};

/**
 * Find article by id
 */
exports.anime = function(req, res, next, id) {
    Anime
        .findOne({
            _id: id
        },{
            'episodes.updated': 0,
            updated: 0,
        })
        .exec(function(err, anime) {
            if (err) return next(err);
            if (!anime) return next(new Error('Failed to load anime ' + id));
            req.anime = anime;
            next();
        });
};

/**
 * List of anime
 */
exports.all = function(req, res) {
    Anime.find({},
        {
            title: 1,
            status: 1, 
            classification: 1, 
            fanart: 1, 
            poster: 1, 
            type: 1, 
            description: 1
        }).sort('-created').exec(function(err, anime) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.json(anime);
        }
    });
};

var setUpdatedByField = function(currentAnime, user){
    currentAnime.updated = currentAnime.updated || {};
    currentAnime.updated.date = new Date();
    currentAnime.updated.by = user;
};

var setAnimeFields = function(currentAnime, givenAnime){
    currentAnime.title          = givenAnime.title;
    currentAnime.status         = givenAnime.status;
    currentAnime.classification = givenAnime.classification;
    currentAnime.type           = givenAnime.type;
    currentAnime.description    = givenAnime.description;  
};

var findImagefiles = function(gfs, collection, fileIds){
    var ids = fileIds.map(function(id) { 
        return new mongoose.Types.ObjectId(id); 
    });

    return new bluebird(function(resolve, reject){
        if(ids.length === 0 )
            return resolve();

        gfs.collection(collection).find({ _id: { $in: ids }}).toArray(function (err, files) {
            if (err || files.length !== ids.length){
                return reject({errors: 'Could not find image with ids: ' + fileIds});
            }
            
            return resolve();
        });
    });
};

var updateImageReferances = function(gfs, currentModel, givenModel, collection, imagepathOnModel){
    var resolver = bluebird.pending(),
        imageIdsToAdd;
    
    imageIdsToAdd = _.difference(givenModel[imagepathOnModel], currentModel[imagepathOnModel]);

    findImagefiles(gfs, collection, imageIdsToAdd)
    .then(function(){
        currentModel[imagepathOnModel] = givenModel[imagepathOnModel];
        resolver.resolve(currentModel);
    })
    .catch(function(err){
        resolver.reject(err);
    });

    return resolver.promise;

};

var updateEpisodeImageReferances = function(gfs, currentModel, givenModel){
    var promises = [];

    currentModel.episodes.forEach(function(currentEpisode){
        var givenEpisode = _.find(givenModel.episodes, function(ep){
            return ep._id.toString() === currentEpisode._id.toString();
        });
        promises.push(updateImageReferances(gfs, currentEpisode, givenEpisode, config.imageCollections.episodeImage, 'images'));
    });

    return bluebird.all(promises);
};

var updateIdsOnNewEpisodes = function(givenAnime){
    givenAnime.episodes = givenAnime.episodes.map(function(episode){
        if(typeof episode._id === 'undefined')
            episode._id = new mongoose.Types.ObjectId();
        return episode;
    });
};

var updateEpisodes = function(currentAnime, givenAnime){
    var currentIds, givenIds, operations;

    updateIdsOnNewEpisodes(givenAnime);
    
    currentIds = currentAnime.episodes.map(function(e){return e._id.toString();});
    givenIds = givenAnime.episodes.map(function(e){return e._id.toString();});

    operations = {
        toAdd: _.difference(givenIds, currentIds),
        toRemove: _.difference(currentIds, givenIds),
        toModify: _.intersection(givenIds, currentIds)
    };

    // Remove deleted
    currentAnime.episodes = currentAnime.episodes.filter(function(episode){
        var shouldDelete = operations.toRemove.indexOf(episode._id.toString()) > 0;
        return !shouldDelete;
    });

    console.log(util.format('Episodes to add: %d, Episodes to remove %d, Episodes to modify %d', operations.toAdd.length, operations.toRemove.length, operations.toModify.length));
    
    // Add new episodes
    operations.toAdd.forEach(function(id){
        var newEpisode = _.cloneDeep(_.find(givenAnime.episodes, function(ep){ 
            return ep._id.toString() === id.toString(); 
        }));

        delete newEpisode.images;
        
        currentAnime.episodes.push(newEpisode);
    });

};

/**
 * Create an anime 
 * or
 * update one anime with a given id
 */
exports.create = exports.update = function(req, res) {
    var currentAnime, response, givenAnime = req.body, gfs = req.gfs;

    if(req.anime){
        currentAnime = req.anime;
        response = 200;
    }
    else{
        currentAnime = new Anime();
        response = 201;
    }

    setUpdatedByField(currentAnime, req.user);
    setAnimeFields(currentAnime, givenAnime);
    updateEpisodes(currentAnime, givenAnime);

    bluebird.all([
        updateImageReferances(gfs, currentAnime, givenAnime, config.imageCollections.fanart, 'fanart'),
        updateImageReferances(gfs, currentAnime, givenAnime, config.imageCollections.poster, 'poster'),
        updateEpisodeImageReferances(gfs, currentAnime, givenAnime)
    ]).then(function(){
        return bluebird.promisify(currentAnime.save, currentAnime)();
    }).then(function(savedAnime){
        res.json(response, savedAnime);
    }).catch(function(err){
        res.json(400, {
            errors: err.errors || err,
            anime: givenAnime
        });
    });
};