var crypto = require('crypto')
    , Q = require('q');

var addDetailsId = function(model){
    var json = model.toJSON();
    json.details_id = model.id;
    return json;
}
/*
 * GET anime listing.
 */
exports.getById = function(req, res){
    var id = req.params.id;
    db.models.Anime.find(id).success(function(anime){
        console.log("REQ USER");    
        console.log(req.user);
        res.send(addDetailsId(anime));
    });
};
exports.getDetailsById = function(req, res){
    var id = req.params.id;
    var includeQuery = [
        db.models.Episode,
        //db.models.Genre,
        //db.models.Synonym
    ];


    db.models.Anime.find({where: {id:id}, include:includeQuery}).success(function(anime){

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
            
            delete ret.title;
            delete ret.desc;
            delete ret.image;
            delete ret.fanart;
            delete ret.status;
            delete ret.runtime;
            delete ret.classification;
            delete ret.type;

            if(typeof(req.user) !== "undefined")
                ret.loggedIn = "YEAH!!!";
            
            res.send(ret);
        });
    });
};


