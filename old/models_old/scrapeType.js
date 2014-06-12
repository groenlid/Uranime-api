/*
 *  The scrapeType model
 *  */
var Sequelize = require('sequelize');

self = {
    def: {
        type: Sequelize.STRING,
        description: Sequelize.TEXT
    }
};

module.exports = function(db){
    return db.define('scrape_types', self.def)
};