/*
 * GET feed of seen episodes.
 */

exports.getFeed = function(req, res){

  // Simple first.. Get last 10 seen episodes..
  db.models.SeenEpisode.findAll({limit:10, order: 'id DESC'}).success(function(seenEpisodes){
    
    res.send(seenEpisodes);
    
  });
};

exports.getBySearchQuery = function(req, res){
 
};
