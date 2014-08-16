module.exports = function(db){
    return {
        options: require('./options'),
        appenddb: require('./appenddb')(db),
        auth: require('./authentication'),
        appendconstants: require('./appendconstants')(db)
    }
};