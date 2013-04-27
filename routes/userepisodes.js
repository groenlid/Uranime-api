/*
 * GET feed of seen episodes.
 */

exports.getFeed = function(req, res){
    var includeQuery = [
        {model: db.models.User, as:'User'},
        {model: db.models.Episode, as: 'Episode'}
    ];

  // Simple first.. Get last 10 seen episodes..
  db.models.SeenEpisode.findAll({limit:10, order: 'id DESC', include: includeQuery}).success(function(seenEpisodes){
    
    for(var i = 0; i < seenEpisodes.length; i++)
      seenEpisodes[i].user = seenEpisodes[i].user.prepared();
    res.send(seenEpisodes);
    
  });
};

exports.getBySearchQuery = function(req, res){
 
};