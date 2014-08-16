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
    is_hentai: {
    	type: Boolean,
    	default: false
    },
    parentGenre: {
        type: String,
        ref: 'Genre'
    }
},{
    collection: 'genre'
});

mongoose.model('Genre', GenreSchema);

exports.Schema = GenreSchema;