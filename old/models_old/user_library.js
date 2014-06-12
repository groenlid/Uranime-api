/*
 *  The user model
 *  */
var Sequelize = require('sequelize');

var self = {
    def: {
        title: Sequelize.STRING,
        image: Sequelize.STRING,
        total: Sequelize.INTEGER,
        progress: Sequelize.INTEGER
    }
};

module.exports = function(db){
    return db.define('user_libraries', self.def);
};