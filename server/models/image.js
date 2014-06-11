'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ImageSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    filename: {
        type: String,
        default: '',
        trim: true
    },
    height: Number,
    width: Number,
    url: String
});

mongoose.model('Image', ImageSchema);

exports.Schema = ImageSchema;