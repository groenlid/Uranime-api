'use strict';

/**
 * Module dependencies.
 */
 var thinky = require('../config/thinky'),
     type = thinky.type,
     bcrypt = require('bcryptjs'),
     config = require('../config/config');

/**
 * User Schema
 */
var UserSchema = thinky.createModel('users', {
    id: type.string(),
    name: type.string().required(),
    email: type.string().required().email(),
    username: type.string().required(),
    roles: [type.string()],
    password: type.string().required()
});

/**
 * Pre-save hook
 */
UserSchema.pre('save', function (done) {
    var self = this;
    if (this.getOldValue('password') == this.password && this.isSaved()) {
        return done();
    }
    bcrypt.hash(self.password, config.passwordRounds, function (err, hash) {
        if (err) {
            return done(err);
        }
        self.password = hash;
        done();
    });
});


/**
 * Methods
 */
 /**
  * HasRole - check if the user has required role
  *
  * @param {String} plainText
  * @return {Boolean}
  * @api public
  */
UserSchema.define('hasRole', function(role) {
 var roles = this.roles;
 return (roles.indexOf('admin') !== -1 || roles.indexOf(role) !== -1);
});

/**
 * Authenticate - check if the passwords are the same
 *
 * @param {String} plainText
 * @param {Function} callback
 * @api public
 */
UserSchema.define('authenticate', function(plainText, done) {
  bcrypt.compare(plainText, this.password, done);
});


UserSchema.define('toJSON', function() {
  return {
      name: this.name,
      email: this.email,
      username: this.username,
      roles: this.roles
  };
});

module.exports = UserSchema;
