module.exports = function(db){

    var Anime = require('./anime')(db),
        Episode = require('./episode')(db),
        Genre = require('./genre')(db),
        Synonym = require('./synonym')(db),
        SeenEpisode = require('./seenEpisode')(db),
        User = require('./user')(db),
        Site = require('./site')(db),
        Request = require('./request')(db),
        RequestAttribute = require('./requestAttribute')(db),
        RequestInfo = require('./requestInfo')(db),
        ScrapeType = require('./scrapeType')(db);


    // Relationships

    Anime
      .hasMany(Episode)
      .hasMany(Genre, {joinTableName:'anime_genre'})
      .hasMany(Synonym);

    Episode
      .belongsTo(Anime)
      //.hasMany(User, {joinTableName:'user_episodes'});
      .hasMany(SeenEpisode);

    Genre
      .hasMany(Anime, {joinTableName:'anime_genre'});

    Request
      .hasMany(RequestInfo);

    RequestAttribute
      .belongsTo(RequestInfo);

    RequestInfo
      .hasMany(RequestAttribute, {foreignKey: 'anime_request_scrape_info_id'})
      .belongsTo(Request);

    SeenEpisode
      .belongsTo(User)
      .belongsTo(Episode);

    Synonym
      .belongsTo(Anime);

    User
      .hasMany(SeenEpisode);
      //.hasMany(Episode, {joinTableName:'user_episodes'});


  return {
    Anime: Anime,
    Episode: Episode,
    Genre: Genre,
    Synonym: Synonym,
    SeenEpisode: SeenEpisode,
    User: User,
    Site: Site,
    Request: Request,
    RequestAttribute: RequestAttribute,
    RequestInfo: RequestInfo,
    ScrapeType: ScrapeType
  };
}
