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
    self.Anime.hasMany(self.Episode);
    self.Episode.belongsTo(self.Anime);

    // Anime - Genre/Tags
    self.Genre.hasMany(self.Anime, {joinTableName:'anime_genre'});
    self.Anime.hasMany(self.Genre, {joinTableName:'anime_genre'});

    // Anime - Synonyms
    self.Anime.hasMany(self.Synonym);
    self.Synonym.belongsTo(self.Anime);

    // Episode - User
    self.Episode.hasMany(self.User, {joinTableName:'user_episodes'});
    self.User.hasMany(self.Episode, {joinTableName:'user_episodes'});

    // SeenEpisode - User
    self.User.hasMany(self.SeenEpisode);
    self.SeenEpisode.belongsTo(self.User);

    // SeenEpisode - Episode
    self.SeenEpisode.belongsTo(self.Episode);
    self.Episode.hasMany(self.SeenEpisode);
    
    // Request - RequestInfo
    self.Request.hasMany(self.RequestInfo);
    self.RequestInfo.belongsTo(self.Request);

    // RequestInfo - RequestAttribute
    self.RequestInfo.hasMany(self.RequestAttribute, {foreignKey: 'anime_request_scrape_info_id'});
    self.RequestAttribute.belongsTo(self.RequestInfo);

  return self;
}
