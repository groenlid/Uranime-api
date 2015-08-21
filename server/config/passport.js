'use strict';

var User = require('../models/user');

 module.exports = function(passport) {
    // Use local strategy
    var LocalStrategy = require('passport-local').Strategy;
    passport.use(new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password'
        },
        function(username, password, done) {
          User.filter({username: username}).run().then(function(users) {
                if (users.length === 0) {
                    return done(null, false, {
                        message: 'Invalid credentials. The username or password is wrong.'
                    });
                }
                var user = users[0];
                user.authenticate(password, function(err, authenticated){
                    if(err || !authenticated){
                        return done(err, false, {
                            message: 'Invalid credentials. The username or password is wrong.'
                        });
                    }
                    return done(null, user);
                });
            }, function(err){
              return done(err);
            });
          }
    ));
 };
