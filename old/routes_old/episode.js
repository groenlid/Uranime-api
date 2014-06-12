/*
 * GET episode listing.
 */

var addDetailsId = function(episode){
    var json = episode.toJSON();
    json.details_id = episode.id;
    return json;
};

var convertConnectionAndSite = function(connection){
    return {
        id: connection.id,
        source_id: connection.source_id,
        site_id: connection.site_id,
        site_name: connection.site.name,
        link: connection.site.episode_link_url + connection.source_id 
    };
};

exports.getDetailsById = function(req, res){
  
  var id = req.params.id,
      db = req.db,
      includeQuery = [
        db.models.SeenEpisode,
        {
          model: db.models.Connection,
          include: [
            db.models.Site
          ]
        }
    ];
    
    
  db.models.Episode.find({where: {id:id}, include:includeQuery}).success(function(episode){
    if(episode == null)
      return res.send(404, 'Sorry, we cannot find that!');

    var ret = episode.toJSON();
    ret.connections = ret.connections.map(convertConnectionAndSite);
    res.send(ret);
  });

};

exports.putEpisode = function(req, res){
  var db      = req.db,
      episode = req.body, criteria;

  console.dir(episode);

  if(!episode.hasOwnProperty('id'))
    episode.id = req.params.id;

  criteria = { user_id: req.user.id, episode_id: episode.id };

  // Check if the user is allowed to do anything else than mark it as seen

  db.models.SeenEpisode.find({where: criteria}).success(function(seenEpisode){
    var watched = episode.seen;

    // Check if the user has seen the episode before.
    if(seenEpisode === null && watched){
      // If not, register it as seen with timestamp now
      db.models.SeenEpisode.create(criteria).success(function(savedRow){
        episode.seenAt = savedRow.timestamp;
        res.send(episode);
      });
    }
    else if(seenEpisode !== null && !watched){
      // Remove the user seen episode
      seenEpisode.destroy().success(function(){
        episode.seenAt = null;
        res.send(episode);
      });
    }

    // Return the episode back to the user.
  });
};

exports.getById = function(req, res){
  var db      = req.db,
      include = req.loggedIn ? 
      {
        model: db.models.SeenEpisode,
        where: {
          user_id:req.user.id
        }
      } 
      : 
      {};

    db.models.Episode.find(req.params.id, {include: include}).success(function(episode){
        if(episode == null)
          return res.send(404, 'Sorry, we cannot find that!');
        
        // TODO: Check if user is logged inn and add seen status.
        res.send(addDetailsId(episode));
    });
};

function getEpisodeByWeek(req, date, res){
  var db    = req.db,
      query = "episodes.aired BETWEEN DATE_ADD(?, INTERVAL(1 - DAYOFWEEK(?)) DAY) " +
              " AND DATE_ADD(?, INTERVAL(7 - DAYOFWEEK(?)) DAY) AND episodes.aired IS NOT NULL" 

  var r = db.models.Episode.findAll({where: [query, date, date, date, date]}).success(function(episodes){
    res.send(episodes.map(addDetailsId));
  });
};

exports.getByParams = function(req, res){
  if(req.query.week){
    getEpisodeByWeek(req, req.query.week, res);
  }
};
