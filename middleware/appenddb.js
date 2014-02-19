/**
 * Middleware to add db object on the request object
 * options calls.
 **/

module.exports = function(){
    return function(req, res, next) {
        req.db = db;
        next();
    }
};

