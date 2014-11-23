/**
 * Created by groenlid on 14/11/14.
 */
'use strict';

var authorization = require('./middlewares/authorization'),
    episodes = require('../controllers/episodes');

module.exports = function(app) {

    app.route('/episodes/:id/socialInfo')
        .get(episodes.getSocialInformation);

    app.route('/episodes/:id')
        .put(authorization.requiresLogin, episodes.updateEpisode);

};