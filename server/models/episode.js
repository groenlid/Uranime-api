'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var EpisodeSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
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
    image: {
        type: String
    }
});

mongoose.model('Episode', EpisodeSchema);

exports.Schema = EpisodeSchema;