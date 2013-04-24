/*
 *  The request model
 *  */
var Sequelize = require('sequelize');

self = {
    def: {
        title: Sequelize.STRING,
        comment: Sequelize.TEXT,
        ip_adress: Sequelize.TEXT,
        poster: Sequelize.TEXT,
        fanart: Sequelize.TEXT
    }
};

module.exports = function(db){
    return db.define('anime_request', self.def)
};