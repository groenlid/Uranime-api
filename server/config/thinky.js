var thinky = require('thinky'),
    config = require('./config');

module.exports = thinky(config.db);
