var crypto = require('crypto')
    , Q = require('q');

var anime = {

    // TODO: Add as a sequelize instance method
    /**
        Adds a attribute on the json object called details
    */
    addDetailsId: function addDetailsId(model){
        var json = model.toJSON();
        json.details_id = model.id;
        return json;
    },

    // TODO: Add as sequelize instance method.
    /**
        Convert the sequelize connection with associatied sites
        with a more api-friendly version.
    */
    convertConnectionAndSite: function convertConnectionAndSite(connection){
        return {
            id: connection.id,
            source_id: connection.source_id,
            site_id: connection.site_id,
            site_name: connection.site.name,
            link: connection.site.show_link_url + connection.source_id 
        };
    },

    // TODO: Add as prototype method
    /**
        Takes a string and convert it to a date.
        If the string is not a correct date object,
        an error is thrown.
    */
    getDateThrowIfInvalid: function getDateThrowIfInvalid(param){
        var date = new Date(param);
        if(date.toString() === 'Invalid Date') return new Error('Invalid Date');
        return date;
    },

    /**
     * GET anime listing by id
     */
    getById: function getById(req, res){
        var id      = req.params.id,
            that    = this;
            
        db.models.Anime.find(id).success(function(anime){
            if(anime == null)
                return res.send(404, 'Sorry, we cannot find that!');
            res.send(that.addDetailsId(anime));
        });
    },

    getBetweenDates: function getBetweenDates(req, res){
        var after   = req.query.after,
            before  = req.query.before,
            that    = this;   

        db.models.Episode.findAll({
            attributes: ['anime_id'],
            where: {
                aired: {
                    between: [after, before]
                }
            },
            group: 'anime_id'
        }).then(function(episodes){
            // TODO: Make this a prototype method of array.
            var ids = episodes.map(function(e){
                return e.anime_id;
            });
            db.models.Anime.findAll({
                where: {
                    id: ids
                }
            }).then(function(anime){
                res.send(anime.map(that.addDetailsId));
            }, function(){
                res.send(400);
            });
        }, function(error){
            res.send(400);
        });
    },

    getDetailsById: function getDetailsById(req, res){
        var id              = req.params.id,
            that            = this, 
            includeQuery    = [
                db.models.Episode
            ];

        db.models.Anime.find({where: {id:id}, include:includeQuery}).success(function(anime){
            
            if(anime == null)
                return res.send(404, 'Sorry, we cannot find that!');
            
            // This can be replaced when https://github.com/sequelize/sequelize/issues/515 is fixed
            // https://github.com/sequelize/sequelize/issues/388
            
            var getSynonyms = function(anime){
                var deferred = Q.defer();
                anime.getAnimeSynonyms().success(function(synonyms){
                    deferred.resolve(synonyms);
                });
                return deferred.promise;
            };

            var getGenres = function(anime){
                var deferred = Q.defer();
                anime.getGenres().success(function(genres){
                    deferred.resolve(genres);
                });
                return deferred.promise;
            };

            var getConnectionsAndSites = function(anime){
                var deferred = Q.defer();
                anime.getConnections({include:[db.models.Site]}).success(function(connections){
                    deferred.resolve(connections);
                });
                return deferred.promise;
            };

            var getSeenEpisodes = function(anime){
                var deferred = Q.defer();
                db.models.SeenEpisode.getByEpisodesWithUser(anime.episodes).success(function(seen){
                    var seenProper = db.models.SeenEpisode.removePasswordEmailAddGravatarByArray(seen);
                    deferred.resolve(seenProper);
                });
                return deferred.promise;
            };
            
            // TODO: use Q.all with object instead of array.
            Q.all([getGenres(anime), getSeenEpisodes(anime), getSynonyms(anime), getConnectionsAndSites(anime)]).then(function(results){
                var ret = anime.toJSON();
                ret.genres = results[0];
                ret.seen = results[1];
                ret.synonyms = results[2];
                ret.connections = results[3].map(that.convertConnectionAndSite);
                ret.episodes = anime.episodes.map(that.addDetailsId);
                
                if(typeof(req.user) !== "undefined")
                    ret.loggedIn = "YEAH!!!";
                
                res.send(ret);
            }, function(){
                // TODO: Error handling
            });
        });
    },

    getBySearchQuery: function getBySearchQuery(req, res){
      var includeQuery  = [db.models.Synonym],
          title         = req.query.title, 
          titleLower    = title.toLowerCase(),
          that          = this;

      db.models.Anime.findAll({
        where: ["lower(anime_synonyms.title) like ?", '%' + titleLower + '%'], 
        include:includeQuery
      }).success(function(anime){
          res.send(anime.map(that.addDetailsId));
      });
    },

    doSearch: function doSearch(req, res){
        var query   = req.query, 
            title   = query.title, 
            tag     = query.tag, 
            after   = query.after, 
            before  = query.before;
      
      if(typeof title !== 'undefined')
        return this.getBySearchQuery(req,res);
      if(typeof before !== 'undefined' || after !== 'undefined')
         return this.getBetweenDates(req,res);
    }
};

module.exports = {  
    getById: anime.getById,
    getDetailsById: anime.getDetailsById,
    doSearch: anime.doSearch
};
