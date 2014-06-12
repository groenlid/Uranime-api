module.exports = function(consts){
   return function(req, res, next) {
        req.consts = consts;
        next();
    }
};