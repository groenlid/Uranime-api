
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , config = require('./config/config.json')
  , auth = require('./auth')
  , user = require('./routes/user')
  , anime = require('./routes/anime')
  , episode = require('./routes/episode')
  , search = require('./routes/search')
  , seenEpisode = require('./routes/userepisodes')
  , request = require('./routes/request')
  , http = require('http')
  , path = require('path');

/**
 * Database and authorization setup.
 */

GLOBAL.app = express();
GLOBAL.db = require('./database')(config.development);
GLOBAL.passport = auth.passport;

app.use(function(req, res, next) {
    var oneof = false;
    if(req.headers.origin) {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        oneof = true;
    }
    if(req.headers['access-control-request-method']) {
        res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
        oneof = true;
    }
    if(req.headers['access-control-request-headers']) {
        res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
        oneof = true;
    }
    if(oneof) {
        res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
    }

    // intercept OPTIONS method
    if (oneof && req.method == 'OPTIONS') {
        res.send(200);
    }
    else {
        next();
    }
});

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(passport.initialize());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'client/build')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/api/anime/:id', passport.authenticate(['basic','anonymous'], { session: false }), anime.getById);
app.get('/api/episodes/:id', passport.authenticate(['basic','anonymous'], { session: false }), episode.getById);
app.get('/api/episodes', episode.getByParams);
app.get('/api/users/:id', user.getById);
app.get('/api/library/:id', user.getLibrary);
app.get('/api/library', user.getLibrary);
app.get('/api/users', user.list);
app.get('/api/search', search.doSearch);
app.get('/api/userEpisodes', seenEpisode.getFeed);
app.get('/api/requests', request.getRequests);
app.get('/api/request_types/:id', request.getRequestTypeById);
app.get('/api/sites/:id', request.getSiteById);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
