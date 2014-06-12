/*
 *  The site model
 *  */
var Sequelize = require('sequelize');

self = {
    def: {
        name: Sequelize.STRING,
        description: Sequelize.TEXT,
        url: Sequelize.STRING,
        show_link_url: Sequelize.STRING,
        episode_link_url: Sequelize.STRING
    }
};

module.exports = function(db){
    return db.define('sites', self.def)
};