'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    episodeSchema = require('./episode').Schema,
    connectionSchema = require('./connection').Schema;

var statusStates = 'finished currently unaired'.split(' ');
var classificationStates = 'G PG PG-13 R R+ Rx'.split(' ');
var typeStates = 'tv ova special ona movie other'.split(' ');

/**
 * Anime Schema
 */
var AnimeSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        default: '',
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    status: {
    	type: String,
    	enum: statusStates
    },
    classification: {
    	type: String,
    	enum: classificationStates
    },
    type: {
    	type: String,
    	enum: typeStates
    },
    poster: {
        type: String
    },
    fanart: {
        type: String
    },
    episodes: [episodeSchema],
    genres: [{
        type: String,
        ref: 'Genre'
    }],
    connections: [connectionSchema]
}, {
	collection: 'anime'
});

/**
 * Validations
 */
AnimeSchema.path('title').validate(function (title) {
    return title.length;
}, 'Title cannot be blank');

/**
 * Pre/Post hooks
 */
AnimeSchema.pre('save', function (next) {
    this.updated = Date.now();
    next();
});

mongoose.model('Anime', AnimeSchema);

exports.schema = AnimeSchema;