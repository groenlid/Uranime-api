'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    version = require('mongoose-version'),
    episodeSchema = require('./episode').Schema,
    connectionSchema = require('./connection').Schema;

var statusStates = 'finished currently unaired'.split(' ');
var classificationStates = 'G PG PG-13 R R+ Rx'.split(' ');
var typeStates = 'tv ova special ona movie other'.split(' ');

/**
 * Anime Schema
 */
var AnimeSchema = new Schema({
    updated: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
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
    	enum: classificationStates
    },
    type: {
    	type: String,
    	enum: typeStates
    },
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
    this.updated = Date.now();
    next();
});

mongoose.model('Anime', AnimeSchema);

exports.schema = AnimeSchema;