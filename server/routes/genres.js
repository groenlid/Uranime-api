'use strict';

var genres = require('../controllers/genres.js');

module.exports = function(app) {
    app.route('/api/genres')
        .get(genres.all);
};