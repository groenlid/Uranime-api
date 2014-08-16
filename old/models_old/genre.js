/*
 *  The genre model
 *  */
var Sequelize = require('sequelize');

self = {
    def: {
        name: Sequelize.STRING,
        description: Sequelize.TEXT,
        is_genre: Sequelize.BOOLEAN
    }
};

module.exports = function(db){
    return db.define('genre', self.def);
};