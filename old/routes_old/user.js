var util = require('util')
   , Q = require('q');
/*
 * GET users listing.
 */
var moduleObject = {

  /**
    Lists up the users
    */
  list: function list(req, res){
    res.send('respond with resources');
  },

  getLibrary: function getLibrary(req, res){
    var userid = (req.query.user_id !== null) ? 
        req.query.user_id :
        req.params.id;
    moduleObject._getUserLibrary(req.db, res, userid);
  },

  getById: function getById(req, res){
    moduleObject._getUserById(req, res, req.params.id);
  },

  _getUserLibrary: function _getUserLibrary(db, res, id){
    db.models.UserLibrary.findAll({where: {user_id: id}}).success(function(userLibrary){
      res.send(userLibrary.map(moduleObject._createUserLibraryItemId));
    });
    return;
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
        res.send(result.map(moduleObject._createUserLibraryItemId));
    });
  },

  _createUserLibraryItemId: function _createUserLibraryItemId(libraryItem){
    libraryItem.id = util.format('%s-%s', libraryItem.user_id, libraryItem.anime_id);
    return libraryItem;
  },

  _getUserById: function _getUserById(req, res, id){
    req.db.models.User.find(id).success(function(user){
      user.getUserEpisodes({limit:10, order: 'id DESC'}).success(function(seen){
        var ret = user.prepared();

        ret.userEpisodes = seen;
        res.send(ret);
      });
    });
  }
};

module.exports = {
  list: moduleObject.list,
  getLibrary: moduleObject.getLibrary,
  getById: moduleObject.getById
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
