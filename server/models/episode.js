'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    connectionSchema = require('./connection').EpisodeSchema;


/**
 * The episode schema.
 * It's not it's own model, and should only be used
 * as embedded.
 * @type {Schema}
 */
var EpisodeSchema = new Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
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
    connections: [connectionSchema],
    images: [mongoose.Schema.Types.ObjectId]
});

exports.Schema = EpisodeSchema;