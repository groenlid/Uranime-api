var crypto = require('crypto')
    , Q = require('q');


// Add as a sequelize instance method
var addDetailsId = function(model){
    var json = model.toJSON();
    json.details_id = model.id;
    return json;
};


var addEpisodeSeenStatus = function(episode, userEpisodes){    
    episode.seen = null;
    
    for (var i = userEpisodes.length - 1; i >= 0; i--) {
        var userEpisode = userEpisodes[i];
        if(episode.id !== userEpisode.episode_id)
            continue;
        episode.seen = true;
        episode.seenAt = userEpisode.timestamp;
        userEpisodes.splice(i,1);
        break;
    };
    
    return episode;
};

var convertConnectionAndSite = function(connection){
    return {
        id: connection.id,
        source_id: connection.source_id,
        site_id: connection.site_id,
        site_name: connection.site.name,
        link: connection.site.show_link_url + connection.source_id 
    };
};

// Prototype the date object instead..
var getDateThrowIfInvalid = function(param){
    var date = new Date(param);
    if(date.toString() === 'Invalid Date') return new Error('Invalid Date');
    return date;
};

module.exports = {
    /*
     * GET anime listing.
     */
    getById: function(req, res){
        var id = req.params.id;
        db.models.Anime.find(id).success(function(anime){
            if(anime == null)
                return res.send(404, 'Sorry, we cannot find that!');
            res.send(addDetailsId(anime));
        });
    },

    getBetweenDates: function(req, res){
        var after  = req.query.after,
            before = req.query.before;   

        db.models.Episode.findAll({
            attributes: ['anime_id'],
            where: {
                aired: {
                    between: [after, before]
                }
            },
            group: 'anime_id'
        }).then(function(episodes){
            var ids = episodes.map(function(e){
                return e.anime_id;
            });
            db.models.Anime.findAll({
                where: {
                    id: ids
                }
            }).then(function(anime){
                res.send(anime.map(addDetailsId));
            }, function(){
                res.send(400);
            });
        }, function(error){
            res.send(400);
        });
    },

    getDetailsById: function(req, res){
        var id = req.params.id;
        
        var includeQuery = [db.models.Episode];
        
        /*if(typeof(req.user) === "undefined"){ 
        var includeQuery = [
                db.models.Episode
            ]
        }
        else{
            includeQuery = [
                {
                    model: db.models.Episode, 
                    include: [
                        {
                            model: db.models.SeenEpisode,
                            where: {user_id: req.user.id},
                            required: false
                        }
                    ]
                }
            ];    
        }*/

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

            var getUserSeenEpisodes = function(anime){
                var deferred = Q.defer();
                if(typeof(req.user) === "undefined")
                    deferred.resolve();
                else{
                    var ids = anime.episodes.map(function(e){
                        return e.id;
                    });
                    db.models.SeenEpisode.findAll({where: {user_id:req.user.id, episode_id: ids}}).success(function(seen){
                        deferred.resolve(seen);
                    });
                }
                return deferred.promise;
            };
            
            Q.all([
                    getGenres(anime), 
                    getSeenEpisodes(anime), 
                    getSynonyms(anime), 
                    getConnectionsAndSites(anime),
                    getUserSeenEpisodes(anime)]
                    ).then(function(results){

                var ret = anime.toJSON();
                ret.genres = results[0];
                ret.seen = results[1];
                ret.synonyms = results[2];
                ret.connections = results[3].map(convertConnectionAndSite);
                ret.episodes = anime.episodes.map(addDetailsId);
                
                if(req.loggedIn){
                    var loggedInUsersEpisodes = results[4];
                    ret.episodes = ret.episodes.map(function(x){return addEpisodeSeenStatus(x,loggedInUsersEpisodes)});
                }
                res.send(ret);
            }, function(){
                res.send(500, "Oops, something went wrong");
            });
        });
    },

    getBySearchQuery: function(req, res){
      var includeQuery = [db.models.Synonym],
          title = req.query.title, 
          titleLower = title.toLowerCase();

      db.models.Anime.findAll({
        where: ["lower(anime_synonyms.title) like ?", '%' + titleLower + '%'], 
        include:includeQuery
      }).success(function(anime){
          res.send(anime.map(addDetailsId));
      });
    },

    doSearch: function(req, res){
      var query = req.query, title = query.title, tag = query.tag, 
          after = query.after, before = query.before,
          publicMethods = module.exports;
      
      if(typeof title !== 'undefined')
        return publicMethods.getBySearchQuery(req,res);
      if(typeof before !== 'undefined' || after !== 'undefined')
         return publicMethods.getBetweenDates(req,res);
    }
};
