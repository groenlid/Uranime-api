var crypto = require('crypto');
var async = require('async');

function fetchAnime(id, callback){
  db.models.Anime.find(id).success(function(anime){
    callback(null, anime);
  });
};

function fetchAssocEpisodes(anime, callback){
  anime.getEpisodes().success(function(episodes){
    callback(null, episodes);
  });
};

function fetchAssocGenres(anime, callback){
  anime.getGenres().success(function(genres){
    callback(null, genres);
  })
};

function fetchAssocSynonyms(anime, callback){
  anime.getSynonyms().success(function(synonyms){
    callback(null, synonyms);
  });
}

function fetchAssocLatestSeen(episodes, callback){
  var query, ids = function(array){
    var r = [];
    for(var i = 0; i < array.length; i++)
      r.push(array[i].id);
    return r;
  };
  query = "SELECT count(*) as amount, MAX(timestamp) as last, user_id, u.id, nick, email " +
                  "FROM user_episodes " +
                  "LEFT JOIN users u ON(user_id = u.id) " +
                  "WHERE episode_id IN (" + ids(episodes) + ") " +
                  "GROUP BY user_id " +
                  "ORDER BY last DESC " +
                  "LIMIT 0,10";

  db.client.query(query).success(function(seen){
    callback(seen);
  });
};

/*
 * GET anime listing.
 */

exports.getById = function(req, res){
  var anime;
  
  async.waterfall([
    function(callback){
      callback(null, req.params.id);
    },
    fetchAnime
  ], 
  function(err, result){
    anime = result;
    console.log(result);

    // Fetch anime episodes, genres, synonyms
    async.parallel({
      genres: function(callback){
        fetchAssocGenres(anime, callback);
      },
      episodes: function(callback){
        fetchAssocEpisodes(anime, callback);
      },
      synonyms: function(callback){
        fetchAssocSynonyms(anime, callback);
      }
    },
      function(err, result){
        // Fetch the assoc latest seen episodes
        var genres = result.genres,
            episodes = result.episodes,
            synonyms = result.synonyms;

        // Stitch the thing together
        fetchAssocLatestSeen(episodes, function(seen){
            var ret = anime.toJSON();
            ret.episodes = episodes;
            ret.genre = genres;
            ret.synonyms = synonyms;

            for(var i = 0; i < seen.length; i++)
            {
              var email = "" + seen[i].email;
              delete seen[i].email;

              // Add gravatar
              var md5sum = crypto.createHash('md5');
              md5sum.update(email);
              seen[i].gravatar = "http://www.gravatar.com/avatar/" + md5sum.digest('hex');
            }
            
            ret.last_seen = seen;
            res.send(ret);
        });
      });

  });

};