'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    SocialEpisodeInfo = mongoose.model('SocialEpisodeInfo');

exports.getSocialInformation = function(req, res) {
    var id = req.params.id;
    SocialEpisodeInfo.findOne({
        _id: id
    }).exec(function(err, socialEpisodeInfo) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            socialEpisodeInfo.removePrivateSeens(req.user);
            res.json(socialEpisodeInfo);
        }
    });
};
