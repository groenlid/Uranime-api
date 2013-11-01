/*
 *  The token model
 *  */
var Sequelize = require('sequelize');

self = {
    def: {
        token: Sequelize.STRING,
        createdAt: Sequelize.DATE,

    }
};

module.exports = function(db){
    return db.define('tokens', self.def);
};
