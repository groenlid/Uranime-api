'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.Types.ObjectId;


/**
 * The episode schema.
 * Contains the
 * @type {Schema}
 */
var SocialEpisodeInfoSchema = new Schema({
    // The _id field is the same as the episode._id
    anime: {
        type: ObjectId,
        ref: 'Anime'
    },
    seenBy: [{
        user: {
            type: ObjectId,
            ref: 'User'
        },
        history: [{
            seenAt: Date,
            client: String
        }],
        private: Boolean
    }],
    comments: [new Schema({
        user: {
            type: ObjectId,
            ref: 'User'
        },
        text: String,
        written: Date,
        updated: Date,
        replyTo: {
            type: ObjectId,
            required: false
        }
    })],
    rating: [{
        user: {
            type: ObjectId,
            ref: 'User'
        },
        rating:{ type: Number, min: 1, max: 10 }
    }]
}, {
    collection: 'socialEpisodeInfo'
});

SocialEpisodeInfoSchema.index({ anime: 1, type: -1 });
SocialEpisodeInfoSchema.index({ 'seenBy.user': 1, type: -1 });

SocialEpisodeInfoSchema.methods = {
    removePrivateSeens: function(user){
        this.seenBy = this.seenBy.filter(function(seenBy){
            return user !== undefined ?
                    seenBy.user.toString() === user._id.toString() || !seenBy.private :
                    !seenBy.private;
        });
    },

    toJSON: function(){
        return {
            episode: this._id,
            anime: this.anime,
            seenBy: this.seenBy,
            comment: this.comment,
            rating: this.rating
        };
    }
};

mongoose.model('SocialEpisodeInfo', SocialEpisodeInfoSchema);

exports.Schema = SocialEpisodeInfoSchema;