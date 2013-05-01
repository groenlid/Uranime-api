var crypto = require('crypto')
    , Q = require('q');

/*
 * GET anime listing.
 */
exports.getById = function(req, res){
    var id = req.params.id;
    var includeQuery = [
        db.models.Episode,
        //db.models.Genre,
        //db.models.Synonym
    ];


    db.models.Anime.find({where: {id:id}, include:includeQuery}).success(function(anime){

        console.log("Amount of episodes:" + anime.episodes.length);
        // This can be replaced when https://github.com/sequelize/sequelize/issues/515 is fixed
        // https://github.com/sequelize/sequelize/issues/388
        
        var getSynonyms = function(anime){
            var deferred = Q.defer();
            console.dir(anime);
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

            if(typeof(req.user) !== "undefined")
                ret.loggedIn = "YEAH!!!";

            res.send(ret);
        });
    });
};