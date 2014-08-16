/*
 *  The SeenEpisode model
 *  */
var   Sequelize = require('sequelize')
    , q = require('q')
    , crypto = require('crypto');

self = {
    def: {
        timestamp: Sequelize.DATE
    },

    methods: {
        classMethods: {
            getByEpisodesWithUser: function(db, episodes){
                var query, ids = function(array){
                    var r = [];
                    for(var i = 0; i < array.length; i++)
                        r.push(array[i].id);
                    return r;
                };
                query = "SELECT count(*) as amount, MAX(timestamp) as last, user_id, u.id, nick, email " +
                    "FROM user_episodes " +
                    "LEFT JOIN users u ON(user_id = u.id) " +
                    "WHERE episode_id IN (" + ids(episodes) + ") " +
                    "GROUP BY user_id " +
                    "ORDER BY last DESC " +
                    "LIMIT 0,10";

                return db.client.query(query);
            },
            removePasswordEmailAddGravatarByArray: function(array){
                var that = this,
                    result = [];
                
                array.forEach(function(item){
                    result.push(that.removePasswordEmailAddGravatar(item));
                });

                return result;
            },
            removePasswordEmailAddGravatar: function(objContainingUser){
                var email = "" + objContainingUser.email;
                delete objContainingUser.email;

                // Add gravatar
                var md5sum = crypto.createHash('md5');
                md5sum.update(email);
                objContainingUser.gravatar = "http://www.gravatar.com/avatar/" + md5sum.digest('hex');
                return objContainingUser;
            }
        }
    }
};

module.exports = function(db){
    return db.define('user_episodes', self.def, self.methods);
};