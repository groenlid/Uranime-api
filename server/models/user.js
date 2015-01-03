'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcryptjs'),
    config = require('../config/config'),
    validator = require('validator');

/**
 * User Schema
 */
var UserSchema = new Schema({
    name: String,
    email: String,
    username: {
        type: String,
        unique: true
    },
    roles: [{
        type: String,
        default: 'authenticated'
    }],
    password: String
});

/**
 * Validations
 */

UserSchema.path('username').validate(function(username) {
    return (typeof username === 'string' && username.length > 0);
}, 'Username cannot be blank');

UserSchema.path('password').validate(function(hashed_password) {
    return (typeof hashed_password === 'string' && hashed_password.length > 0);
}, 'Password cannot be blank');

UserSchema.path('email').validate(function(email) {
    if(typeof email === 'undefined') return true;
    return validator.isEmail(email);
}, 'Email cannot be blank');

/**
 * Pre-save hook
 */
UserSchema.pre('save', function (done) {
    var self = this;
    if (!this.isModified('password') && !this.isNew) {
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
UserSchema.methods = {

    /**
     * HasRole - check if the user has required role
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    hasRole: function(role) {
        var roles = this.roles;
        return (roles.indexOf('admin') !== -1 || roles.indexOf(role) !== -1);
    },

    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @param {Function} callback
     * @api public
     */
    authenticate: function(plainText, done) {
        bcrypt.compare(plainText, this.password, done);
    },

    toJSON: function(){
        return {
            name: this.name,
            email: this.email,
            username: this.username,
            roles: this.roles
        };
    }
};

mongoose.model('User', UserSchema);
