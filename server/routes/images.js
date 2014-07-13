'use strict';

var authorization = require('./middlewares/authorization'),
	images = require('../controllers/images');

module.exports = function(app) {

    app.route('/api/images/fanarts')
        .post(authorization.requiresAdmin, images.uploadFanart);

    app.route('/api/images/fanarts/:id')
    	.get(images.downloadFanart);

    app.route('/api/images/posters')
    	.post(authorization.requiresAdmin, images.uploadPoster);

    app.route('/api/images/posters/:id')
    	.get(images.downloadPoster);

    app.route('/api/images/episodes')
    	.post(authorization.requiresAdmin, images.uploadEpisodeImage);

    app.route('/api/images/episodes/:id')
    	.get(images.downloadEpisodeImage);

};