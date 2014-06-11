'use strict';

var anime = require('../controllers/anime');

module.exports = function(app) {

    app.route('/api/anime/:animeId')
        .get(anime.show);


    app.route('/api/anime')
        .get(anime.all);

    app.param('animeId', anime.anime);

};