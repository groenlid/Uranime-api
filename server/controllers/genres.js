'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Genre = mongoose.model('Genre');

/**
 * List all genres
 */
exports.all = function(req, res) {
    Genre.find({}).exec(function(err, genres) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.json(genres);
        }
    });
};
