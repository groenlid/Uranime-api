'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User');

 module.exports = function(passport) {
    // Use local strategy
    var LocalStrategy = require('passport-local').Strategy;
    passport.use(new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password'
        },
        function(username, password, done) {
            User.findOne({
                username: username
            }, function(err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {
                        message: 'Invalid credentials. The username or password is wrong.'
                    });
                }
                user.authenticate(password, function(err, authenticated){
                    if(err || !authenticated){
                        return done(err, false, {
                            message: 'Invalid credentials. The username or password is wrong.'
                        });
                    }
                    return done(null, user);
                });
            });
        }
    ));
 };