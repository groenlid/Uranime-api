'use strict';

/**
 * Module dependencies.
 */
var models = require('../models'),
    User = models.User,
    config = require('../config/config'),
    jwt = require('jwt-simple');

/**
 * Creates the token after the passport login with basic auth.
 */
exports.createToken = function(req, res){
    var expires = new Date().getTime() + config.tokenDurationInMS,
        user = req.user;
        console.log("User");
        console.log(user);
    res.json({
        token : jwt.encode({
            iss: user._id,
            exp: expires
        }, config.tokenSecret),
        expires: expires,
        user: user.toJSON()
    });
};

/**
 * Create user
 */
exports.create = function(req, res, next) {
    var user = new User(req.body);

    user.provider = 'local';

    req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
    req.assert('username', 'Username cannot be more than 20 characters').len(1,20);

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors);
    }

    // Hard coded for now. Will address this with the user permissions system in v0.3.5
    user.roles = ['authenticated'];
    user.save(function(err) {
        if (err) {
            switch (err.code) {
                case 11000:
                case 11001:
                    res.status(400).send('Username already taken');
                    break;
                default:
                    res.status(400).send('Please fill all the required fields');
            }

            return res.status(400);
        }
        res.status(201).send('Created');
    });
};
/**
 * Send User
 */
exports.me = function(req, res) {
    res.json(req.user);
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    User
        .findOne({
            _id: id
        })
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user) return next(new Error('Failed to load User ' + id));
            req.profile = user;
            next();
        });
};
