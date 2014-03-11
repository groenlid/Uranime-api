var crypto = require('crypto')
    , Q = require('q');

var moduleObject = {

    // TODO: Add as a sequelize instance method. Maybe overwrite toJSON();
    /**
        Adds a attribute on the json object called details
    */
    addDetailsId: function addDetailsId(model){
        var json = model.toJSON();
        json.details_id = model.id;
        return json;
    },

    addDetailsIdAndPrepareConnection: function addDetailsIdAndPrepareConnection(model){
        var modelWithId = moduleObject.addDetailsId(model);
        modelWithId.connections = modelWithId.connections.map(moduleObject.convertConnectionAndSite);
        return modelWithId;
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
            link: connection.episode_id == null ? 
                    connection.site.show_link_url + connection.source_id :
                    connection.site.episode_link_url + connection.source_id
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

	addEpisodeSeenStatus: function addEpisodeSeenStatus(episode, userEpisodes){    
        episode.seen = null;
    
        for (var i = userEpisodes.length - 1; i >= 0; i--) {
            var userEpisode = userEpisodes[i];
            if(episode.id !== userEpisode.episode_id)
                continue;
            episode.seen = true;
            episode.seenAt = userEpisode.timestamp;
            userEpisodes.splice(i,1);
            break;
        }
    
        return episode;
	},

    /**
     * GET anime listing by id
     */
    getById: function getById(req, res){
        var id      = req.params.id;
    
        req.db.models.Anime.find(id).success(function(anime){
            if(anime == null)
                return res.send(404, 'Sorry, we cannot find that!');
            res.send(moduleObject.addDetailsId(anime));
        });
    },

    getBetweenDates: function getBetweenDates(req, res){
        var after   = req.query.after,
            before  = req.query.before,
            models  = req.db.models;   

        models.Episode.findAll({
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
            models.Anime.findAll({
                where: {
                    id: ids
                }
            }).then(function(anime){
                res.send(anime.map(moduleObject.addDetailsId));
            }, function(){
                res.send(400);
            });
        }, function(error){
            res.send(400);
        });
    },

    getDetailsById: function getDetailsById(req, res){
        var id              = req.params.id,
            db              = req.db, 
            models          = db.models, 
            includeQuery    = [
                { 
                    model: models.Episode, 
                    include: [
                        { 
                            model:models.Connection, 
                            include: [
                                models.Site
                            ]
                        }
                    ]
                }
            ];

        models.Anime.find({where: {id:id}, include:includeQuery}).success(function(anime){
            
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
                anime.getConnections({include:[models.Site]}).success(function(connections){
                    deferred.resolve(connections);
                });
                return deferred.promise;
            };

            var getSeenEpisodes = function(anime){
                var deferred = Q.defer();
                models.SeenEpisode.getByEpisodesWithUser(db, anime.episodes).success(function(seen){
                    var seenProper = models.SeenEpisode.removePasswordEmailAddGravatarByArray(seen);
                    deferred.resolve(seenProper);
                });
                return deferred.promise;
            };

            var getUserSeenEpisodes = function(anime){
                var deferred = Q.defer();
                if(!req.loggedIn)
                    deferred.resolve();
                else{
                    var ids = anime.episodes.map(function(e){
                        return e.id;
                    });
                    models.SeenEpisode.findAll({where: {user_id:req.user.id, episode_id: ids}}).success(function(seen){
                        deferred.resolve(seen);
                    });
                }
                return deferred.promise;
            };
            
            // TODO: use Q.all with object instead of array.
            Q.all([getGenres(anime), getSeenEpisodes(anime), getSynonyms(anime), getConnectionsAndSites(anime), getUserSeenEpisodes(anime)]).then(function(results){
                var ret = anime.toJSON();
                ret.genres = results[0];
                ret.seen = results[1];
                ret.synonyms = results[2];
                ret.connections = results[3].map(moduleObject.convertConnectionAndSite);
                ret.episodes = anime.episodes.map(moduleObject.addDetailsIdAndPrepareConnection);

                if(req.loggedIn){
                    var loggedInUsersEpisodes = results[4];
                    ret.episodes = ret.episodes.map(function(x){return moduleObject.addEpisodeSeenStatus(x,loggedInUsersEpisodes)});
                }
                res.send(ret);
            }, function(){
                res.send(500, "Oops, something went wrong");
            });
        });
    },

    getBySearchQuery: function getBySearchQuery(req, res){
      var db            = req.db,
          models        = db.models,
          includeQuery  = [models.Synonym],
          title         = req.query.title, 
          titleLower    = title.toLowerCase();
          
      models.Anime.findAll({
        where: ["lower(anime_synonyms.title) like ?", '%' + titleLower + '%'], 
        include:includeQuery
      }).success(function(anime){
        console.log("helli");
        res.send(anime.map(moduleObject.addDetailsId));
      });
    },

    getByConnection: function getByConnection(req, res){
        var query           = req.query,
            db              = req.db,
            models          = db.models,
            source_id       = query.source_id,
            site            = query.site_id,
            includeQuery    = [
                { 
                    model: models.Connection,
                    where: { source_id:source_id, site_id: site },
                    include: [ models.Site ]
                }
            ];

        models.Anime.findAll({include: includeQuery}).success(function(anime){
            res.send(anime.map(moduleObject.addDetailsIdAndPrepareConnection));
        });
    },

    doSearch: function doSearch(req, res){
        var query       = req.query, 
            title       = query.title, 
            tag         = query.tag, 
            after       = query.after, 
            before      = query.before,
            site        = query.site_id,
            source_id   = query.source_id;
      
        if(typeof title !== 'undefined')
            return moduleObject.getBySearchQuery(req,res);
        if(typeof before !== 'undefined' && after !== 'undefined')
            return moduleObject.getBetweenDates(req,res);
        if(typeof site !== 'undefined' && source_id !== 'undefined')
            return moduleObject.getByConnection(req, res);
        return res.send(400);
    }
};

module.exports = {  
    getById: moduleObject.getById,
    getDetailsById: moduleObject.getDetailsById,
    doSearch: moduleObject.doSearch
};
