'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('lodash');

/**
 * Contains the possitble mapping enums etc.
 */
var rules = {
    myanimelist: {},
    anidb: {
        mappings: ['normal']
    },
    thetvdb: {},
    themoviedb: {},
    trakt: {}
};

/**
 * Common Schema definition
 */

var commonDefinition = {
    site_id: {
        type: Number,
        required: true
    },
    site: {
        type: String,
        enum: Object.keys(rules),
        required: true
    },
    comment: {
        type: String,
        default: '',
        trim: true
    }
};

/**
 * Connection Schema
 */
var AnimeConnectionSchema = new Schema(_.extend({
    mapping: {
        type: String,
        required: true
    }
}, commonDefinition));

var EpisodeConnectionSchema = new Schema(commonDefinition);

/**
 * Virtuals
 */
AnimeConnectionSchema.virtual('link').get(function () {
    return rules[this.site].anime_link;//util.format(sites[this.site], this.site_id);
});


/**
 * Validations
 */
AnimeConnectionSchema.path('mapping').validate(function (mapping) {
    return _.contains(rules[this.site].mappings, mapping);
}, 'This site does not support this mapping.');

/**
 * Methods
 */
 
AnimeConnectionSchema.methods = {
    
};


module.exports = {
    EpisodeSchema: EpisodeConnectionSchema,
    AnimeSchema: AnimeConnectionSchema
};