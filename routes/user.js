
/*
 * GET users listing.
 */

function getUserById(res, id, includeLibrary){
  db.models.User.find(id).success(function(user){
    user.getUserEpisodes({limit:10, order: 'id DESC'}).success(function(seen){
      var ret = user.prepared();

      ret.userEpisodes = seen.map(function(item){
        var item = item.toJSON();  
        
        item.user       = item.user_id;
        item.episode    = item.episode_id;

        delete item.user_id;
        delete item.episode_id;
        
        return item;
      });
      res.send(ret);
    });
  });

};

function getUserLibrary(res, id){
  var sql = "SELECT ue.user_id as user_id, "+
              "ep.anime_id as anime_id, "+
              "ep2.tot as total, "+
              "MAX(ue.timestamp) as last_seen, " +
              "COUNT(ep.id) as progress " +
            "FROM episodes ep, user_episodes ue, ( "+
              "SELECT e.anime_id as anime_id, COUNT(e.id) as tot " +
              "FROM episodes e " +
              "GROUP BY e.anime_id " +
            ") as ep2 " +
            "WHERE ep.id = ue.episode_id " +
              "AND ep2.anime_id = ep.anime_id " +
              "AND ue.user_id = ? " +
            "GROUP BY ue.user_id, ep.anime_id;";
    db.client.query(sql, null, {raw:true}, [id]).success(function(result){
        var ret = result.map(function(item){
            item.id     = item.user_id + '-' + item.anime_id;
            item.anime  = item.anime_id;
            item.user   = item.user_id;

            delete item.anime_id;
            delete item.user_id;

            return item; 
        });
      res.send(ret);
  });
}

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.getLibrary = function(req, res){
  var userid = (req.query.user_id != null) ? 
      req.query.user_id :
      req.params.id;
  getUserLibrary(res, userid);
};

exports.getById = function(req, res){
  getUserById(res, req.params.id);
};

/*
{
  user_id: 1,
  nick: "Groenlid",
  library: [
    {
      user_id: 2,
      anime_id: 4,
      progress: 10,
      total: 20,
    }
  ]
}
*/
