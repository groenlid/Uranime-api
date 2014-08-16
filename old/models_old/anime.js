/*
 *  The anime model
 *  */
var Sequelize = require('sequelize');

self = {
    def: {
        title: Sequelize.STRING,
        desc: Sequelize.TEXT,
        image: Sequelize.STRING,
        fanart: Sequelize.STRING,
        status: Sequelize.STRING,
        runtime: Sequelize.INTEGER,
        classification: Sequelize.STRING,
        type: Sequelize.STRING,
        episode_count: Sequelize.INTEGER
    }
};

module.exports = function(db){
    return db.define('anime', self.def);
};