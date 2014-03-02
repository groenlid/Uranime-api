

var moduleObject = {
    /*
     * GET feed of seen episodes.
     */
    getFeed: function getFeed(req, res){
      // Simple first.. Get last 10 seen episodes..
        req.db.models.SeenEpisode.findAll({limit:10, order: 'id DESC'}).success(function(seenEpisodes){
            var ret = [];

            seenEpisodes.forEach(function(seenEpisode, i){
                seenEpisode = seenEpisode.toJSON();
                ret.push(seenEpisode);
            });
            res.send(ret);
        })
    }
    
};

module.exports = {
    getFeed: moduleObject.getFeed
};
