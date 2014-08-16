/*
 *  The user model
 *  */
var Sequelize = require('sequelize')
    , crypto = require('crypto');

self = {
    def: {
        nick: Sequelize.STRING,
        joined: Sequelize.DATE,
        email: Sequelize.STRING,
        desc: Sequelize.TEXT,
        password: Sequelize.STRING,
        pw_version: Sequelize.INTEGER
    },
    methods:{
        instanceMethods: {
            gravatar: function(){
                var md5sum = crypto.createHash('md5');
                md5sum.update(this.email);
                return "http://www.gravatar.com/avatar/" + md5sum.digest('hex');
            },

            prepared: function(){
                var json = this.toJSON();
                json.gravatar = this.gravatar();
                delete json.pw_version;
                delete json.password;
                delete json.email;
                return json;
            }
        }
    }
};

module.exports = function(db){
    return db.define('users', self.def, self.methods)
};