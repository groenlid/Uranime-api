/*
 * GET feed of seen episodes.
 */

exports.getFeed = function(req, res){
  // Simple first.. Get last 10 seen episodes..
  var ret = [];
  db.models.SeenEpisode.findAll({limit:10, order: 'id DESC', include: ['User','Episode']}).success(function(seenEpisodes){
    seenEpisodes.forEach(function(s){
      
      var json = s.toJSON();
      json.user = s.user.toJSON();
      json.user.gravatar = s.user.gravatar();
      delete json.user.password;
      delete json.user.email;
      json.episode = s.episode;

      ret.push(json);
    });
    res.send(ret);
  });
};

exports.getBySearchQuery = function(req, res){
 
};