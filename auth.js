
var passport = require('passport')
    , BasicStrategy = require('passport-http').BasicStrategy
    , crypto = require('crypto')
    , bcrypt = require('bcrypt')
    , async = require('async')
    , loginFailureMessage = "Wrong username or password";

function findUser(username, clearText, callback){
    db.models.User.find({where: {email: username} }).success(function (user) {
        if(user == null)
            callback(loginFailureMessage);
        else
            callback(null, user, clearText)
    });
};

function checkPassword(user, clearText, callback){
    var clearSalt = db.options.salt + clearText,
        shasum;

    // Check if the user uses the old password format
    switch(user.pw_version){
        case 2:
            bcrypt.compare(clearText, user.password, function(err, res){
                if(err)
                    console.log("something went wrong here... Should log");
                if(err || !res)
                    callback(loginFailureMessage);
                else
                    callback(null, user);
            });
            break;
        case 1:
        default:
            // Pepper, hash and compare.
            shasum = crypto.createHash('sha1');
            shasum.update(clearSalt);
            var hashed = shasum.digest('hex');
            if(hashed === user.password)
                callback(null, user, clearText);
            else
                callback(loginFailureMessage);
            break;
    }
};

/**
 * Update the user's password to the new hashing method.
 * @param user the user object
 * @param clearText the user's cleartext password
 * @param callback the callback function for use with async
 */
function convertPassword(user, clearText, callback){
    var salt_rounds = db.options.salt_rounds;

    if(typeof clearText === "function"){
        callback = clearText;
        return callback(null, user);
    }

    bcrypt.hash(clearText, salt_rounds, function(err, hash) {
        // Store hash in your password DB.
        if(err)
            return callback(err);
        user.password = hash;
        user.pw_version = 2;
        user.save().success(function() {
            return callback(null, user);
        });
    });
};

passport.use(new BasicStrategy(
    function(username, password, done) {

        async.waterfall([
            function(callback){
                callback(null, username, password);
            },
            findUser,
            checkPassword,
            convertPassword
        ],
        function(err, result){
            if(err)
                return done(null, false);
            done(null, result);
        });
    }
));

function notLimitUser(req, res, next){
    passport.authenticate('basic', { session: false }, function(err, user, info) {
        if (err) { return next(err); }
        next();
    })(req, res, next);
};


module.exports = {
    passport: passport,
    notLimitUser: notLimitUser
};
