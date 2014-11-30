/**
 * Created by groenlid on 14/11/14.
 */
'use strict';

var authorization = require('./middlewares/authorization'),
    episodes = require('../controllers/episodes');

module.exports = function(app) {

    app.route('/episodes/:episodeId/socialInfo')
        .get(episodes.getSocialInformation)
        .put(authorization.requiresLogin, episodes.updateSocialInformation);

    app.route('/episodes/:episodeId')
        .put(authorization.requiresLogin, episodes.updateEpisode);

    app.param('episodeId', episodes.episode);
};