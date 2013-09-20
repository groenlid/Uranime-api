/*
 * GET feed of seen episodes.
 */

exports.getFeed = function(req, res){

  // Simple first.. Get last 10 seen episodes..
    db.models.SeenEpisode.findAll({limit:10, order: 'id DESC'}).success(function(seenEpisodes){
        var ret = [];

        seenEpisodes.forEach(function(seenEpisode, i){
            seenEpisode = seenEpisode.toJSON();
            seenEpisode.user    = seenEpisode.user_id;
            seenEpisode.episode = seenEpisode.episode_id;

            delete seenEpisode.user_id;
            delete seenEpisode.episode_id;
            ret.push(seenEpisode);
        });
        
        res.send(ret);
    
  });
};

exports.getBySearchQuery = function(req, res){
 
};
