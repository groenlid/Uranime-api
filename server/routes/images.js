'use strict';

var authorization = require('./middlewares/authorization'),
	images = require('../controllers/images');

module.exports = function(app) {

    app.route('/api/images/fanarts')
        .post(authorization.requiresAdmin, images.uploadFanart);

    app.route('/api/images/posters')
    	.post(authorization.requiresAdmin, images.uploadPoster);

    app.route('/api/images/episodes')
    	.post(authorization.requiresAdmin, images.uploadEpisodeImage);

};