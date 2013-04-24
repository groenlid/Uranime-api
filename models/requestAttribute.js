/*
 *  The RequestAttribute model
 *  */
var Sequelize = require('sequelize');

self = {
    def: {
        value: Sequelize.STRING,
        type_id: Sequelize.INTEGER
    }
};

module.exports = function(db){
    return db.define('anime_request_scrape_attributes', self.def)
};