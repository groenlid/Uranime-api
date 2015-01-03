'use strict';
var config = require('../../config/config'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');

/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.send(401, 'User is not authenticated');
    }
    next();
};

/**
 * Generic require Admin routing middleware
 * Basic Role checking - future release with full permission system
 */
exports.requiresAdmin = function(req, res, next) {
    if (!req.isAuthenticated() || !req.user.hasRole('admin')) {
        return res.send(401, 'User is not authorized');
    }
    next();
};

exports.fetchUserObjectFromToken = function(req, res, next) {
    var decodedToken = req[config.tokenPath];

    if(!decodedToken){
        return next();
    }
    
    User.findOne({_id: decodedToken.iss}, function(err, user){
        if(err){
            return res.send(401, 'User is not authenticated');
        }
        req.user = user.toJSON();
        next();
    });
};

/*
exports.checkToken = function(req, tokenOverride){
    var deferred = Q.defer(),
        db = req.db,
        tokenPrepend = 'Auth-Token ';

    // Check if the authentication header is correct formatted
    var auth = req.headers.authorization;

    if(typeof tokenOverride !== "undefined")
        auth = tokenPrepend + tokenOverride;

    if(typeof auth == "undefined" || auth.search(tokenPrepend) !== 0) {
        deferred.reject();
        return deferred.promise;
    }
    
    var authorizationTokenWithUsername = new Buffer(auth.split(tokenPrepend)[1], 'base64').toString();
       
    // Check if token is valid. Date and token
    var userId = authorizationTokenWithUsername.split(':')[0];
    var token =  authorizationTokenWithUsername.split(':')[1];
    
    // TODO: Use include here.
    db.models.User.find(userId).then(function (user) {
        user.getToken().then(function(dbtoken){
            if(dbtoken.token === token)
                deferred.resolve(user);
            else
                deferred.reject(new Error(loginFailureMessage));
        }, function(){
            deferred.reject(new Error(loginFailureMessage));
        });

    }, function(){
        deferred.reject(new Error(loginFailureMessage));
    });
    // Fetch user profile and add it to the req object

    return deferred.promise;
};

 module.addCheckTokenMethod = function(req, res, next){
        req.checkToken = moduleObject.checkToken;
        next();
    },

    tokenAuthentication: function tokenAuthentication(req, res, next) {
        moduleObject.checkToken(req).then(function(user){
            req.user = user;
            req.loggedIn = true;
            next();
        },function(error){
            if(typeof error == "undefined"){
                req.loggedIn = false;
                next();
            }
            else
                res.send(loginFailureMessage, 401);
        });
    },

    tokenAuthenticationRequired: function tokenAuthenticationRequired(req, res, next){
        moduleObject.checkToken(req).then(function(user){
            req.user = user;
            req.loggedIn = true;
            next();
        },function(){
            ïf(typeof error == "undefined")
                return res.send(401, "You must be logged in to perform this action.");
            res.send(401, loginFailureMessage);
        });
    }

};*/