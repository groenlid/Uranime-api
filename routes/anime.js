var crypto = require('crypto')
    , Q = require('q');


// Add as a sequelize instance method
var addDetailsId = function(model){
    var json = model.toJSON();
    json.details_id = model.id;
    return json;
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
        
        console.log(req.params);

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
        var includeQuery = [
            db.models.Episode,
            //db.models.Genre,
            //db.models.Synonym
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

            var getSeenEpisodes = function(anime){
                var deferred = Q.defer();
                db.models.SeenEpisode.getByEpisodesWithUser(anime.episodes).success(function(seen){
                    var seenProper = db.models.SeenEpisode.removePasswordEmailAddGravatarByArray(seen);
                    deferred.resolve(seenProper);
                });
                return deferred.promise;
            };
            
            Q.all([getGenres(anime), getSeenEpisodes(anime), getSynonyms(anime)]).then(function(results){
                var ret = anime.toJSON();
                ret.genres = results[0];
                ret.seen = results[1];
                ret.synonyms = results[2];
                ret.episodes = anime.episodes.map(addDetailsId);
                
                if(typeof(req.user) !== "undefined")
                    ret.loggedIn = "YEAH!!!";
                
                res.send(ret);
            }, function(){
                
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
     
      console.log(arguments); 
      if(typeof title !== 'undefined')
        return publicMethods.getBySearchQuery(req,res);
      console.log("1");
      if(typeof before !== 'undefined' || after !== 'undefined')
         return publicMethods.getBetweenDates(req,res);
      console.log("2");
    }
};
