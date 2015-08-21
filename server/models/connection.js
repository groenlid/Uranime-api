'use strict';

// /**
//  * Module dependencies.
//  */
// var mongoose = require('mongoose'),
//     Schema = mongoose.Schema,
//     _ = require('lodash');
//
// /**
//  * Contains the possitble mapping enums etc.
//  */
// var mappings = {
//     myanimelist: [],
//     anidb: ['normal'],
//     thetvdb: ['season'],
//     themoviedb: [],
//     trakt: []
// };
//
// /**
//  * Common Schema definition
//  */
//
// var commonDefinition = {
//     siteId: {
//         type: Number,
//         required: true
//     },
//     site: {
//         type: String,
//         enum: Object.keys(mappings),
//         required: true
//     },
//     comment: {
//         type: String,
//         default: '',
//         trim: true
//     }
// };
//
// /**
//  * Connection Schema
//  */
// var AnimeConnectionSchema = new Schema(_.extend({
//     mapping: {
//         type: String
//     },
//     season: {
//         type: String
//     }
// }, commonDefinition));
//
// var EpisodeConnectionSchema = new Schema(commonDefinition);
//
//
// /**
//  * Validations
//  */
// AnimeConnectionSchema.path('mapping').validate(function (mapping) {
//     return _.contains(mappings[this.site], mapping);
// }, 'This site does not support this mapping.');
//
// /**
//  * Methods
//  */
//
// AnimeConnectionSchema.methods = {
//
// };
//
//
// module.exports = {
//     EpisodeSchema: EpisodeConnectionSchema,
//     AnimeSchema: AnimeConnectionSchema
// };
module.exports = {};
