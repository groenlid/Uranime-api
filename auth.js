
var   crypto = require('crypto')
    , bcrypt = require('bcrypt')
    , Q = require('q')
    , loginFailureMessage = {Error: "Wrong username or password"};

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
    // Find the user
    findUser(username).then(function(user){
        // Check the password
        checkPassword(user, password).then(function(user){
            // convert password if needed,
            if(user.pw_version == 2){
                deferred.resolve(user);
                return deferred.promise;
            }
            convertPassword(user, password).then(function(user){
                deferred.resolve(user);
            }, function(){
                deferred.reject();
            });
        }, function(){
            deferred.reject();
        });
    }, function(){
        deferred.reject();
    });
    // else return user.
    return deferred.promise;
}

var makeTokenResponse = function(token){
    var user_id = token.get('user_id'),
        token   = token.get('token'),
        sep     = ':';
    console.log(user_id, token, sep);
    return {
        user_id: user_id,
        auth_token: new Buffer(user_id + sep + token).toString('base64') 
    }
}

var signin = function(req, res){
    var email = req.param('email'),
        pass = req.param('password');
    
    login(email, pass).then(function(user){
        // Generate or send user the old token
        user.getToken().then(function(dbtoken){
            if(dbtoken !== null)
                // TODO:Check date of token
                res.send(makeTokenResponse(dbtoken));
            else
                // Token does not exists
                crypto.randomBytes(48, function(ex, buf) {
                    var userToken = buf.toString('hex');
                    db.models.Token.create({
                        user_id: user.id,
                        token: userToken
                    }).then(function(newtoken){
                        res.send(makeTokenResponse(newtoken));
                    });
                });
        }, function(err){
            res.send(500);
        })
    }, function(error){
        res.send(401, loginFailureMessage);
    });  
    
};

// Simple middleware the adds the user to the req if token is correct.

var checkToken = function(req){
    var deferred = Q.defer(),
        tokenPrepend = 'Auth-Token ';
    
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
