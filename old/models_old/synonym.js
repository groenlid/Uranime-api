/*
 *  The synonym model
 *  */
var Sequelize = require('sequelize');

self = {
    def: {
        title: Sequelize.STRING,
        lang: Sequelize.STRING
    }
};

module.exports = function(db){
    return db.define('anime_synonyms', self.def);
};