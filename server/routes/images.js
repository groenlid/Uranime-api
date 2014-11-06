'use strict';

var authorization = require('./middlewares/authorization'),
	images = require('../controllers/images');

module.exports = function(app) {

    app.route('/images/fanart')
        .post(authorization.requiresAdmin, images.uploadFanart);

    app.route('/images/fanart/:id')
    	.get(images.downloadFanart);

    app.route('/images/poster')
    	.post(authorization.requiresAdmin, images.uploadPoster);

    app.route('/images/poster/:id')
    	.get(images.downloadPoster);

    app.route('/images/episode')
    	.post(authorization.requiresAdmin, images.uploadEpisodeImage);

    app.route('/images/episode/:id')
    	.get(images.downloadEpisodeImage);

};