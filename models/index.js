module.exports = function(db){
    var self = {
      Anime: require('./anime')(db),
      Episode: require('./episode')(db),
      Genre: require('./genre')(db),
      Synonym: require('./synonym')(db),
      SeenEpisode: require('./seenEpisode')(db),
      User: require('./user')(db),
      Site: require('./site')(db),
      Request: require('./request')(db),
      RequestAttribute: require('./requestAttribute')(db),
      RequestInfo: require('./requestInfo')(db),
      ScrapeType: require('./scrapeType')(db)
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
