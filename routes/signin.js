var   crypto = require('crypto')
    , bcrypt = require('bcrypt')
    , Q = require('q')
    , loginFailureMessage = {Error: "Wrong username or password"};

var moduleObject = {
    makeTokenResponse: function makeTokenResponse(dbToken){
        var user_id = dbToken.user_id,
            token   = dbToken.token,
            sep     = ':';

        return {
            user_id: user_id,
            auth_token: new Buffer(user_id + sep + token).toString('base64')
        }
    },

    /**
     * Update the user's password to the new hashing method.
     * @param user the user object
     * @param clearText the user's cleartext password
     * @param callback the callback function for use with async
     */
    convertPassword: function convertPassword(user, clearText){
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
    },

    findUser: function findUser(username){
        var deferred = Q.defer();
        db.models.User.find({where: {email: username} }).success(function (user) {
            if(user == null)
                deferred.reject(loginFailureMessage);
            else
                deferred.resolve(user);
        });
        return deferred.promise;
    },

    checkPassword: function checkPassword(user, clearText){
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
    },

    checkCredentials: function checkCredentials(username, password) {
        var deferred = Q.defer();
        // Find the user
        moduleObject.findUser(username).then(function(user){
            // Check the password
            moduleObject.checkPassword(user, password).then(function(user){
                // convert password if needed,
                if(user.pw_version == 2){
                    deferred.resolve(user);
                    return deferred.promise;
                }
                moduleObject.convertPassword(user, password).then(function(user){
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
    },

    signin: function signin(req, res){
        var email   = req.param('email'),
            pass    = req.param('password'),
            token   = req.param('auth_token');
        
        moduleObject.checkCredentials(email, pass).then(function(user){
            // Generate or send user the old token
            user.getToken().then(function(dbtoken){
                if(dbtoken !== null)
                    // TODO:Check date of token
                    res.send(moduleObject.makeTokenResponse(dbtoken));
                else
                    // Token does not exists
                    crypto.randomBytes(48, function(ex, buf) {
                        var userToken = buf.toString('hex');
                        db.models.Token.create({
                            user_id: user.id,
                            token: userToken
                        }).then(function(newtoken){
                            res.send(moduleObject.makeTokenResponse(newtoken));
                        });
                    });
            }, function(err){
                res.send(500);
            })
        }, function(error){
            res.send(401, loginFailureMessage);
        });  
    }
};

module.exports = {
    signin: moduleObject.signin
};