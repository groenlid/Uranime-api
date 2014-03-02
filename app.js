
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , config = require('./config/config.json')
  , user = require('./routes/user')
  , anime = require('./routes/anime')
  , episode = require('./routes/episode')
  , signin = require('./routes/signin')
  , seenEpisode = require('./routes/userepisodes')
  , request = require('./routes/request')
  , http = require('http')
  , path = require('path')
  , consts = require('constants')
  , db = require('./database')(config.development)
  , middleware = require('./middleware')(db, consts);

/**
 * Database and authorization setup.
 */

var app = express();

// Constants
app.locals(consts);

// Middlewares
app.use(middleware.options);
app.use(middleware.appendconstants);
app.use(middleware.appenddb);
app.use(middleware.auth.addCheckToken);

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'client/build')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/api/anime/:id', middleware.auth.token, anime.getById);
app.get('/api/animeDetails/:id', middleware.auth.token, anime.getDetailsById);
app.get('/api/anime', anime.doSearch);
app.get('/api/episodes/:id', episode.getById);
app.get('/api/episodeDetails/:id', episode.getDetailsById);
app.get('/api/episodes', episode.getByParams);
app.get('/api/users/:id', user.getById);
app.get('/api/libraries/:id', user.getLibrary);
app.get('/api/libraries', user.getLibrary);
app.get('/api/users', user.list);
app.get('/api/userEpisodes', seenEpisode.getFeed);
app.get('/api/requests', request.getRequests);
app.get('/api/request_types/:id', request.getRequestTypeById);
app.get('/api/sites/:id', request.getSiteById);
app.post('/api/signin', signin.signin);
app.put('/api/episodes/:id', middleware.auth.tokenRequired, episode.putEpisode);

db.client.authenticate().complete(function(err, result) {
  if(err !== null)
    return console.log("Could not connect to database");

  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });
});