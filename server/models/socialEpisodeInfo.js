'use strict';
//
// var mongoose = require('mongoose'),
//     Schema = mongoose.Schema,
//     ObjectId = mongoose.Schema.Types.ObjectId;
//
//
// /**
//  * The episode schema.
//  * Contains the
//  * @type {Schema}
//  */
// var SocialEpisodeInfoSchema = new Schema({
//     // The _id field is the same as the episode._id
//     anime: {
//         type: ObjectId,
//         ref: 'Anime'
//     },
//     watched: [{
//         user: {
//             type: ObjectId,
//             ref: 'User'
//         },
//         client: String,
//         markedDate: {
//             type: Date,
//             default: Date.now
//         },
//         private: Boolean
//     }],
//     currentlyWatching: [{
//         user: {
//             type: ObjectId,
//             ref: 'User'
//         },
//         client: String,
//         markedDate: {
//             type: Date,
//             default: Date.now
//         },
//         private: Boolean
//     }],
//     comments: [new Schema({
//         user: {
//             type: ObjectId,
//             ref: 'User'
//         },
//         text: String,
//         written: Date,
//         updated: Date,
//         replyTo: {
//             type: ObjectId,
//             required: false
//         }
//     })],
//     rating: [{
//         user: {
//             type: ObjectId,
//             ref: 'User'
//         },
//         rating:{ type: Number, min: 1, max: 10 }
//     }]
// }, {
//     collection: 'socialEpisodeInfo'
// });
//
// SocialEpisodeInfoSchema.index({ anime: 1, type: -1 });
// SocialEpisodeInfoSchema.index({ 'watched.user': 1, type: -1 });
//
// SocialEpisodeInfoSchema.methods = {
//     removePrivateSeens: function(user){
//
//         this.watched = this.watched.filter(function(watched){
//             return user !== undefined ?
//                     watched.user.toString() === user._id.toString() || !watched.private :
//                     !watched.private;
//         });
//     },
//
//     toJSON: function(){
//         return {
//             _id: this._id,
//             anime: this.anime,
//             watched: this.watched,
//             comment: this.comment,
//             rating: this.rating,
//             currentlyWatching: this.currentlyWatching
//         };
//     }
// };
//
// SocialEpisodeInfoSchema.statics.currentlyWatching = function(callback) {
//     this.find({'currentlyWatching.1': {$exists: true}}, {currentlyWatching: true, anime: true}, callback);
// };
//
// mongoose.model('SocialEpisodeInfo', SocialEpisodeInfoSchema);

exports.Schema = {};
