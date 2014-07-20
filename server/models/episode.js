'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

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
    images: [mongoose.Schema.Types.ObjectId]
});

//mongoose.model('Episode', EpisodeSchema); // This isn't its own model... 

exports.Schema = EpisodeSchema;