'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Anime = mongoose.model('Anime');

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
            'episodes.created': 0,
            'updated': 0,
            'created': 0
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
            title:1,
            status:1, 
            classification:1, 
            fanart:1, 
            poster:1, 
            type:1, 
            description:1
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


/**
 * Create an anime
 */
exports.create = function(req, res) {
    var anime = new Anime(req.body);

    anime.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                anime: anime
            });
        } else {
            res.json(anime);
        }
    });
};