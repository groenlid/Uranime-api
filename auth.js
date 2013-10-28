
var passport = require('passport')
    , BasicStrategy = require('passport-http').BasicStrategy
    , AnonymousStrategy = require('passport-anonymous').Strategy
    , crypto = require('crypto')
    , bcrypt = require('bcrypt')
    , Q = require('q')
    , loginFailureMessage = "Wrong username or password";

var findUser = function findUser(username){
    var deferred = Q.defer();
    db.models.User.find({where: {email: username} }).success(function (user) {
        if(user == null)
            deferred.reject(loginFailureMessage);
        else
            deferred.resolve(user);
    });
    return deferred.promise;
};

var checkPassword = function checkPassword(user, clearText){
    var clearSalt = db.options.salt + clearText,
        shasum, deferred = Q.defer();
    // Check if the user uses the old password format
    switch(user.pw_version){
        case 2:
            bcrypt.compare(clearText, user.password, function(err, res){
                if(err)
                    console.log("something went wrong here... Should log");
                if(err || !res)
                    deferred.reject(loginFailureMessage);
                else
                    deferred.resolve(user);
            });
            break;
        case 1:
            // Pepper, hash and compare.
            shasum = crypto.createHash('sha1');
            shasum.update(clearSalt);
            var hashed = shasum.digest('hex');
            if(hashed === user.password)
                deferred.resolve(user);
            else
                deferred.reject(loginFailureMessage);
            break;
    }
    return deferred.promise;
};

/**
 * Update the user's password to the new hashing method.
 * @param user the user object
 * @param clearText the user's cleartext password
 * @param callback the callback function for use with async
 */
var convertPassword = function convertPassword(user, clearText){
    var salt_rounds = db.options.salt_rounds, deferred = Q.defer();
    bcrypt.hash(clearText, salt_rounds, function(err, hash) {
        // Store hash in your password DB.
        if(err)
             return deferred.reject(err);
        user.password = hash;
        user.pw_version = 2;
        user.save().success(function() {
            return deferred.resolve(user);
        });
    });
    return deferred.promise;
};

var login = function(username, password) {
    var deferred = Q.defer();
    // check username
    findUser(username)
    // check password
    .then(function(user){
        return checkPassword(user, password);
    })
    // convert password if needed,
    // else return user.
    .then(function(user){
        if(user.pw_version == 2){
            deferred.resolve(user);
            return deferred.promise;
        }
        return convertPassword(user, password);
    });
    return deferred.promise;
}

var signin = function(req, res){
    var email = req.param('email'),
        pass = req.param('password');
    
    login(email, pass, function(error, user){
        if(user === false || error !== null)
            res.send(401, loginFailureMessage);
    }).then(function(user){
        res.send("YOUR'E LOGGED IN MISTER!");
    });  
    
};

// Simple middleware the adds the user to the req if token is correct.

var checkToken = function(req){
    var deferred = Q.defer(),
        tokenPrepend = 'AUTH-TOKEN ';
    
    // Check if the authentication header is correct formatted
    var auth = req.headers.authorization;
    if(typeof auth == "undefined" || auth.search(tokenPrepend) !== 0) {
        deferred.reject();
        return deferred.promise;
    }
    
    var authorizationTokenWithUsername = new Buffer(auth.split(tokenPrepend)[1], 'base64').toString();
       
    // Check if token is valid. Date and token
    var userId = authorizationTokenWithUsername.split(':')[0];
    var token =  authorizationTokenWithUsername.split(':')[1];
    
    // TODO: Use include here.
    db.models.User.find({where: {id:userId}/*, include: [db.models.Token]*/}).then(function (user) {
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

var tokenAuthentication = function(req, res, next) {
    checkToken(req).then(function(user){
        req.user = user;
        next();
    },function(error){
        if(typeof error == "undefined")
            next();
        else
            res.send(loginFailureMessage, 401);
    });
};

var tokenAuthenticationRequired = function(req, res, next){
   checkToken(req).then(function(user){
        req.user = user;
        next();
    },function(){
        res.send(loginFailureMessage,401);
    });

};

module.exports = {
    signin: signin,
    token: tokenAuthentication,
    tokenRequired: tokenAuthenticationRequired
};
