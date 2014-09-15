'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    version = require('mongoose-version'),
    episodeSchema = require('./episode').Schema,
    connectionSchema = require('./connection').AnimeSchema;

var statusStates = 'finished currently unaired'.split(' ');
var classificationStates = 'G PG PG-13 R R+ Rx'.split(' ');
var typeStates = 'tv ova special ona movie other'.split(' ');

/**
 * Anime Schema
 */
var AnimeSchema = new Schema({
    updated: {
        date: {
            type: Date,
            default: Date.now,
            required: true
        },
        by: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: false
        }
    },
    title: {
        type: String,
        default: '',
        trim: true,
        required: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    status: {
    	type: String,
    	enum: statusStates,
        required: true
    },
    classification: {
    	type: String,
    	enum: classificationStates,
        required: true
    },
    type: {
    	type: String,
    	enum: typeStates,
        required: true
    },
    titles: [{
        title: String,
        lang: String,
        type: String
    }],
    posters: [mongoose.Schema.Types.ObjectId],
    fanarts: [mongoose.Schema.Types.ObjectId],
    episodes: [episodeSchema],
    genres: [{
        type: String,
        ref: 'Genre'
    }],
    connections: [connectionSchema],
    subscribers: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    }],
}, {
	collection: 'anime'
});

/**
 * Indexes
 */
AnimeSchema.index({ 
    'title': 'text', 
    'titles.title': 'text', 
    'episodes.title': 'text',
    'episodes.titles': 'text' 
});

AnimeSchema.plugin(version, {
    collection: 'anime.versions'
});

/**
 * Validations
 */
AnimeSchema.path('title').validate(function (title) {
    return title && title.length;
}, 'Title cannot be blank');

/**
 * Pre/Post hooks
 */
AnimeSchema.pre('save', function (next) {
    this.updated.date = Date.now();
    next();
});

/**
 * Statics methods
 */

AnimeSchema.statics.latests = function(limit, callback) {
    this.aggregate([
        { $unwind: '$episodes'},
        { $sort: {'episodes.aired': -1}},
        { $limit: limit},
        { $project: {'_id': 1, 'name': 1, 'aired': '$episodes.aired', 'episode': '$episodes.number'}}
    ], callback);
};

mongoose.model('Anime', AnimeSchema);

exports.schema = AnimeSchema;