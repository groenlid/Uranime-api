'use strict';

// User routes use users controller
var users = require('../controllers/users'),
    authorization = require('./middlewares/authorization');

module.exports = function(app, passport) {

    app.route('/users/actions/logout')
        .get(users.signout);
    app.route('/users/me')
        .get(authorization.requiresLogin, users.me);

    // Setting up the users api
    app.route('/users/actions/register')
        .post(users.create);

    // Setting up the userId param
    app.param('userId', users.user);

    // Setting the local strategy route
    app.route('/users/actions/login')
        .post(passport.authenticate('local', {
            session: true
        }), function (req,res) {
            res.send(req.user);
        });
};
