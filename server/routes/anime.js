'use strict';

var anime = require('../controllers/anime'),
	authorization = require('./middlewares/authorization');

module.exports = function(app) {

    app.route('/anime/:animeId')
    	.put(authorization.requiresAdmin, anime.update)
        .get(anime.show);


    app.route('/anime')
        .get(anime.all)
        .post(authorization.requiresAdmin, anime.create);

    app.param('animeId', anime.anime);

};