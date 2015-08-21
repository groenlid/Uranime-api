'use strict';

/**
 * Module dependencies.
 */
var thinky = require('../config/thinky'),
    type = thinky.type,
    user = require('./user');
    //connectionSchema = require('./connection');

var statusStates = 'finished currently unaired'.split(' ');
var classificationStates = 'G PG PG-13 R R+ Rx'.split(' ');
var typeStates = 'tv ova special ona movie other'.split(' ');

/**
 * Anime Schema
 */
var AnimeSchema = thinky.createModel('anime', {
    updated: {
        date: type.date().required().default(Date.now),
        userId: type.string()
    },
    title: type.string().required(),
    description: type.string(),
    status: type.string().enum(statusStates).required(),
    classification: type.string().enum(classificationStates).required(),
    type: type.string().enum(typeStates).required(),
    titles: [{
        title: type.string().required(),
        lang: type.string(),
        type: type.string()
    }],
    posters: [type.string()],
    fanarts: [type.string()],
    /*genres: [{
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
        images: [type.text()],

        markedPrivateBy: [{
            type: ObjectId,
            ref: 'User'
        }]
    })]*/
});

/*
 * Relations
 */

AnimeSchema.belongsTo(user, 'user', 'updated.userid', 'id');

/**
 * Indexes
 */
AnimeSchema.ensureIndex('title');
AnimeSchema.ensureIndex('titles.title');
AnimeSchema.ensureIndex('episodes.title');
AnimeSchema.ensureIndex('episodes.titles');

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

AnimeSchema.defineStatic('lastest', function(limit, callback) {
    this.aggregate([
        { $unwind: '$episodes'},
        { $sort: {'episodes.aired': -1}},
        { $limit: limit},
        { $project: {'_id': 1, 'name': 1, 'aired': '$episodes.aired', 'episode': '$episodes.number'}}
    ], callback);
});

module.exports = AnimeSchema;
