'use strict';

var authorization = require('./middlewares/authorization'),
	images = require('../controllers/images');

module.exports = function(app) {

    app.route('/api/images/fanart')
        .post(authorization.requiresAdmin, images.uploadFanart);

    app.route('/api/images/fanart/:id')
    	.get(images.downloadFanart);

    app.route('/api/images/poster')
    	.post(authorization.requiresAdmin, images.uploadPoster);

    app.route('/api/images/poster/:id')
    	.get(images.downloadPoster);

    app.route('/api/images/episode')
    	.post(authorization.requiresAdmin, images.uploadEpisodeImage);

    app.route('/api/images/episode/:id')
    	.get(images.downloadEpisodeImage);

};