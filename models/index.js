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
        Connection = require('./connection')(db),
        Token = require('./token')(db),
        ScrapeType = require('./scrapeType')(db);


    // Relationships

    Anime
      .hasMany(Episode)
      .hasMany(Genre, {joinTableName:'anime_genre'})
      .hasMany(Connection)
      .hasMany(Synonym);

    Episode
      .belongsTo(Anime)
      .hasMany(Connection)
      //.hasMany(User, {joinTableName:'user_episodes'});
      .hasMany(SeenEpisode);

    Genre
      .hasMany(Anime, {joinTableName:'anime_genre'});

    Request
      .hasMany(Connection);

    RequestAttribute
      .belongsTo(Connection);

    Connection
      //.hasMany(RequestAttribute, {foreignKey: 'anime_request_scrape_info_id'})
      .belongsTo(Request)
      .belongsTo(Anime)
      .belongsTo(Site);

    SeenEpisode
      .belongsTo(User)
      .belongsTo(Episode);

    Synonym
      .belongsTo(Anime);

    User
      .hasMany(SeenEpisode)
      //.hasMany(Episode, {joinTableName:'user_episodes'});
      .hasOne(Token, { foreignKey: 'user_id'});

    Token
      .belongsTo(User);
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
    Connection: Connection,
    ScrapeType: ScrapeType,
    Token: Token
  };
}
