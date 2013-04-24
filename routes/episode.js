/*
 * GET episode listing.
 */

exports.getById = function(req, res){
  
  var r = db.models.Episode.find(req.params.id).success(function(episode){
    db.models.SeenEpisode.findAll({where:{episode_id:req.params.id}}).success(function(SeenEpisodes){

        var ret = episode.toJSON();
        ret.userepisodes = [];
        for(var i = 0; i < SeenEpisodes.length; i++)
        {
            var e = SeenEpisodes[i], user = e.user;

            ret.userepisodes[i] = e.toJSON();

        }
        res.send(ret);
     });
  });

};

function getEpisodeByWeek(date, res){
  var query = "episodes.aired BETWEEN DATE_ADD(?, INTERVAL(1 - DAYOFWEEK(?)) DAY) " +
              " AND DATE_ADD(?, INTERVAL(7 - DAYOFWEEK(?)) DAY) AND episodes.aired IS NOT NULL" 

  var r = db.models.Episode.findAll({where: [query, date, date, date, date]}).success(function(episodes){
    res.send(episodes);
  });
}

exports.getByParams = function(req, res){
  if(req.query.week){
    getEpisodeByWeek(req.query.week, res);
  }
}