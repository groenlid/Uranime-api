'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    version = require('mongoose-version'),
    connectionSchema = require('./connection'),
    ObjectId = mongoose.Schema.Types.ObjectId;

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
            type: ObjectId,
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
        title: {
            type: String,
            required: true,
            trim: true
        },
        lang: {
            type: String
        },
        type: {
            type: String
        }
    }],
    posters: [ObjectId],
    fanarts: [ObjectId],
    genres: [{
        type: String,
        ref: 'Genre'
    }],
    connections: [connectionSchema.AnimeSchema],
    subscribers: [{
        type: ObjectId,
        ref: 'User'
    }],
    episodes: [new Schema({
        name: {
            type: String,
            default: '',
            trim: true
        },
        description: {
            type: String,
            default: '',
            trim: true
        },
        number: {
            type: Number,
            required: true
        },
        special: {
            type: Boolean,
            default: false
        },
        aired: {
            type: Date
        },
        runtime: {
            type: Number,
            default: 0
        },
        titles: [{
            title: {
                type: String,
                required: true,
                trim: true
            },
            lang: {
                type: String
            },
            type: {
                type: String
            }
        }],
        connections: [connectionSchema.EpisodeSchema],
        images: [ObjectId],

        markedPrivateBy: [{
            type: ObjectId,
            ref: 'User'
        }]
    })]
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