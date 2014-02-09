
var   crypto = require('crypto')
    , bcrypt = require('bcrypt')
    , Q = require('q')
    , loginFailureMessage = {Error: "Wrong username or password"};

var moduleObject = {

    checkToken: function checkToken(req, tokenOverride){
        var deferred = Q.defer(),
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
    },

    addCheckToken: function addCheckTokenMethod(req, res, next){
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

};

// Simple middleware the adds the user to the req if token is correct.
module.exports = {
    token: moduleObject.tokenAuthentication,
    tokenRequired: moduleObject.tokenAuthenticationRequired,
    addCheckToken: moduleObject.addCheckToken
};
