'use strict';

var appPath = process.cwd(),
    container = require('dependable').container();

module.exports = function(app, passport, db) {

	function bootstrapModels() {
        // Bootstrap models
        require('./util').walk(appPath + '/server/models', null, function(path) {
            require(path);
        });
    }

    bootstrapModels();

    // Bootstrap passport config
    require(appPath + '/server/config/passport')(passport);


    function bootstrapDependencies() {
        // Register passport dependency
        container.register('passport', function() {
            return passport;
        });

        // Register auth dependency
        container.register('auth', function() {
            return require(appPath + '/server/routes/middlewares/authorization');
        });

        // Register database dependency
        container.register('database', {
            connection: db
        });

        // Register app dependency
        container.register('app', function() {
            return app;
        });
    }

    bootstrapDependencies();

    // Express settings
    require(appPath + '/server/config/express')(app, passport, db);

    return app;

};