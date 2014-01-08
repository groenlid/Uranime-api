/*
 *  The requestInfo model
 *  */
var Sequelize = require('sequelize');

self = {
    def: {
        site_id: Sequelize.INTEGER,
        anime_id: Sequelize.INTEGER,
        source_id: Sequelize.INTEGER
    }
};

module.exports = function(db){
    return db.define('connections', self.def)
};