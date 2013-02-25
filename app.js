
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , config = require('./config')
  , user = require('./routes/user')
  , anime = require('./routes/anime')
  , episode = require('./routes/episode')
  , search = require('./routes/search')
  , seenEpisode = require('./routes/userepisodes')
  , request = require('./routes/request')
  , http = require('http')
  , path = require('path');

GLOBAL.app = express();
GLOBAL.db = require('./database')(config.db);

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
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/anime/:id', anime.getById);
app.get('/episodes/:id', episode.getById);
app.get('/episodes', episode.getByParams);
app.get('/users/:id', user.getById);
app.get('/library/:id', user.getLibrary);
app.get('/library', user.getLibrary);
app.get('/users', user.list);
app.get('/search', search.doSearch);
app.get('/user_episodes', seenEpisode.getFeed);
app.get('/requests', request.getRequests);
app.get('/request_types/:id', request.getRequestTypeById);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
