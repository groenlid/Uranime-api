var Sequelize = require('sequelize');
var crypto = require('crypto');

module.exports = function(db){
  var Anime, Episode, Genre, Synonym, SeenEpisode, User, 
      Request, RequestAttribute, RequestInfo, ScrapeType,
      Site, anime_db_options, self;

    Anime = {
      title: Sequelize.STRING,
      desc: Sequelize.TEXT,
      image: Sequelize.STRING,
      fanart: Sequelize.STRING,
      status: Sequelize.STRING,
      runtime: Sequelize.INTEGER,
      classification: Sequelize.STRING,
      type: Sequelize.STRING
    };

    Episode = {
      name: Sequelize.STRING,
      description: Sequelize.TEXT,
      image: Sequelize.STRING,
      number: Sequelize.INTEGER,
      special: Sequelize.BOOLEAN,
      aired: Sequelize.DATE
    };

    Genre = {
      name: Sequelize.STRING,
      description: Sequelize.TEXT,
      is_genre: Sequelize.BOOLEAN
    };

    Synonym = {
      title: Sequelize.STRING,
      lang: Sequelize.STRING
    };

    SeenEpisode = {
      timestamp: Sequelize.DATE
    };

    User = {
      nick: Sequelize.STRING,
      joined: Sequelize.DATE,
      email: Sequelize.STRING,
      desc: Sequelize.TEXT,
      password: Sequelize.STRING,
    };

    // Request
    Request = {
      title: Sequelize.STRING,
      comment: Sequelize.TEXT,
      ip_adress: Sequelize.TEXT,
      poster: Sequelize.TEXT,
      fanart: Sequelize.TEXT,
    };

    RequestInfo = {
      scrape_id: Sequelize.INTEGER,
      scrape_comment: Sequelize.TEXT,
    };

    RequestAttribute = {
      value: Sequelize.STRING,
      type_id: Sequelize.INTEGER
    };

    ScrapeType = {
      type: Sequelize.STRING,
      description: Sequelize.TEXT,
    };

    Site = {
      name: Sequelize.STRING,
      description: Sequelize.TEXT,
      url: Sequelize.STRING,
      link_id: Sequelize.STRING,
    };

    self = self || {};
    // Methods

    user_db_options = {
      instanceMethods: {
        gravatar: function(){
          var md5sum = crypto.createHash('md5');
          md5sum.update(this.email);
          return "http://www.gravatar.com/avatar/" + md5sum.digest('hex');
        }
      }
    }

    self = {
      Anime: db.define('anime', Anime),
      Episode: db.define('episodes', Episode),
      Genre: db.define('genre', Genre),
      Synonym: db.define('anime_synonyms', Synonym),
      SeenEpisode: db.define('user_episodes', SeenEpisode),
      User: db.define('users', User, user_db_options),
      Site: db.define('sites', Site),
      Request: db.define('anime_request', Request),
      RequestAttribute: db.define('anime_request_scrape_attributes', RequestAttribute),
      RequestInfo: db.define('anime_request_scrape_info', RequestInfo),
      ScrapeType: db.define('scrape_types', ScrapeType),
    };


    // Relationships

    // Anime - Episode
    self.Anime.hasMany(self.Episode, {as: 'Episodes'});
    self.Episode.belongsTo(self.Anime, {as: 'Anime'});

    // Anime - Genre/Tags
    self.Genre.hasMany(self.Anime, {as: 'Anime', joinTableName:'anime_genre'});
    self.Anime.hasMany(self.Genre, {as: 'Genres', joinTableName:'anime_genre'});

    // Anime - Synonyms
    self.Anime.hasMany(self.Synonym, {as: 'Synonyms'});
    self.Synonym.belongsTo(self.Anime, {as: 'Anime'});

    // Episode - User
    self.Episode.hasMany(self.User, {as: 'Users', joinTableName:'user_episodes'});
    self.User.hasMany(self.Episode, {as: 'Episodes', joinTableName:'user_episodes'});

    // SeenEpisode - User
    self.User.hasMany(self.SeenEpisode, {as: 'SeenEpisodes'});
    self.SeenEpisode.belongsTo(self.User, {as: 'User'});

    // SeenEpisode - Episode
    self.SeenEpisode.belongsTo(self.Episode, {as: 'Episode'});
    self.Episode.hasMany(self.SeenEpisode, {as: 'SeenEpisodes'});
    
    // Request - RequestInfo
    self.Request.hasMany(self.RequestInfo, {as: 'RequestInfo'});
    self.RequestInfo.belongsTo(self.Request, {as: 'Request'});

    // RequestInfo - RequestAttribute
    self.RequestInfo.hasMany(self.RequestAttribute, {as: 'RequestAttributes', foreignKey: 'anime_request_scrape_info_id'});
    self.RequestAttribute.belongsTo(self.RequestInfo, {as: 'RequestInfo'});

  return self;
}
