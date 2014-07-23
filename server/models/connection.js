'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    util = require('util');

var sites = {
    myanimelist: 'http://myanimelist.net/anime/%d',
    anidb: 'http://anidb.net/perl-bin/animedb.pl?show=anime&aid=%d',
    thetvdb: 'http://thetvdb.com/?tab=series&id=%d',
    themoviedb: '',
    trakt: ''
};

/**
 * Connection Schema
 */
var ConnectionSchema = new Schema({
    site: {
        type: String,
        trim: true,
        enum: Object.keys(sites),
        required: true
    },
    content: {
        type: String,
        default: '',
        trim: true
    }
});

/**
 * Virtuals
 */
ConnectionSchema.virtual('link').get(function () {
    return util.format(sites[this.site], this.site_id);
});

/**
 * Validations
 */ 
ConnectionSchema.path('site').validate(function (site) {
    return site.length;
}, 'Site cannot be blank');

/**
 * Methods
 */
ConnectionSchema.methods = {

    toJSON: function(){
        return 'test';
    }
};

exports.schema = ConnectionSchema;