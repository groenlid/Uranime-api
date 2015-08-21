'use strict';
var config = require('../../config/config'),
    User = require('../../models/user');

/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).send('User is not authenticated');
    }
    next();
};

/**
 * Generic require Admin routing middleware
 * Basic Role checking - future release with full permission system
 */
exports.requiresAdmin = function(req, res, next) {
    if (!req.isAuthenticated() || !req.user.hasRole('admin')) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

exports.fetchUserObjectFromToken = function(req, res, next) {
    var decodedToken = req[config.tokenPath];

    if(!decodedToken){
        return next();
    }
    
    User.get(decodedToken.iss).then(function(user) {
      req.user = user;
      next();
    }).catch(function(err){
      res.status(401).send('User is not authenticated');
    });
};
