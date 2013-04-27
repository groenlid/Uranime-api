/*
 * GET episode listing.
 */

exports.getById = function(req, res){
  
  var id = req.params.id,
      includeQuery = [
        {model: db.models.SeenEpisode, as:'SeenEpisodes'},
    ];

  db.models.Episode.find({where: {id:id}, include:includeQuery}).success(function(episode){
    res.send(episode);
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