
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
             deferred.reject(err);
        user.password = hash;
        user.pw_version = 2;
        user.save().success(function() {
            deferred.resolve(user);
        });
    });
    return deferred.promise;
};

//////////////////////////////////////////////
// Define the basic authentication strategy //
//////////////////////////////////////////////
passport.use(new BasicStrategy(
    function(username, password, done) {
        var deferred = Q.defer();
        // check username
        findUser(username)
        // check password
        .then(function(user){
            return checkPassword(user, password);
        }, function(error){
            return done(null, false);
        })
        // convert password if needed,
        // else return user.
        .then(function(user){
            if(user.pw_version == 2){
                deferred.resolve(user);
                return deferred.promise;
            }
            return convertPassword(user, password);
        }, function(error){
            return done(null, false);
        })
        .then(function(user){
           console.log("============================== DEBUG====== Logged inn:", user);
            return done(null, user);
        }, function(error){
            console.log("============================== DEBUG====== Not logged inn:", error);
            return done(null, false);
        });
    }
));

///////////////////////////////////
// Define the fallback solution. //
///////////////////////////////////
passport.use(new AnonymousStrategy());

module.exports = {
    passport: passport
};
