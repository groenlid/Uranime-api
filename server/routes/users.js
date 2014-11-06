'use strict';

// User routes use users controller
var users = require('../controllers/users');

module.exports = function(app, passport) {

    app.route('/logout')
        .get(users.signout);
    app.route('/users/me')
        .get(users.me);

    // Setting up the users api
    app.route('/register')
        .post(users.create);

    // Setting up the userId param
    app.param('userId', users.user);

    // Setting the local strategy route
    app.route('/login')
        .post(passport.authenticate('local', {
            session: true
        }), function (req,res) {
            res.send(req.user);
        });
};
