'use strict';

var genres = require('../controllers/genres.js');

module.exports = function(app) {
    app.route('/genres')
        .get(genres.all);
};