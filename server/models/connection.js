'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Article Schema
 */
var ConnectionSchema = new Schema({
    site: {
        type: String,
        trim: true
    },
    content: {
        type: String,
        default: '',
        trim: true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

/**
 * Validations
 */
ConnectionSchema.path('site').validate(function (site) {
    return site.length;
}, 'Site cannot be blank');

mongoose.model('Connection', ConnectionSchema);

exports.schema = ConnectionSchema;