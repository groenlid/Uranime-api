var crypto = require('crypto')
    , RSVP = require('rsvp');

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
        var getGenres = function(anime){
            var promise = new RSVP.Promise();
            anime.getGenres().success(function(genres){
                promise.resolve(genres);
            });
            return promise;
        };

        var getSeenEpisodes = function(anime){
            var promise = new RSVP.Promise();
                db.models.SeenEpisode.getByEpisodesWithUser(anime.episodes).success(function(seen){
                    var seenProper = db.models.SeenEpisode.removePasswordEmailAddGravatarByArray(seen);
                    promise.resolve(seenProper);
                });
            return promise;
        };

        RSVP.all([getGenres(anime), getSeenEpisodes(anime)]).then(function(results){
            var ret = anime.toJSON();
            ret.genres = results[0];
            ret.seen = results[1];
            res.send(ret);
        });
    });
};