'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Tag Schema
 */
var GenreSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    _id: {
        type: String,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    is_genre: {
    	type: Boolean,
    	default: false
    }
},{
    collection: 'genre'
});

mongoose.model('Genre', GenreSchema);

exports.Schema = GenreSchema;