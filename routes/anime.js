var crypto = require('crypto')
    , Q = require('q');

/*
 * GET anime listing.
 */
exports.getById = function(req, res){
    var id = req.params.id;
    var includeQuery = [
        {model: db.models.Episode, as:'Episodes'},
        //{model: db.models.Genre, as:'Genre'},
        {model: db.models.Synonym, as: 'Synonyms'}
    ];


    db.models.Anime.find({where: {id:id}, include:includeQuery}).success(function(anime){

        // This can be replaced when https://github.com/sequelize/sequelize/issues/515 is fixed
        // https://github.com/sequelize/sequelize/issues/388
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
        
        Q.all([getGenres(anime), getSeenEpisodes(anime)]).then(function(results){
            var ret = anime.toJSON();
            ret.genres = results[0];
            ret.seen = results[1];


            if(typeof(req.user) !== "undefined")
                ret.loggedIn = "YEAH!!!";

            res.send(ret);
        });
    });
};