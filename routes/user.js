
/*
 * GET users listing.
 */

function addGravatarAndRemovePasswordEmail(user, json){
  var gravatar = user.gravatar(),
      userJSON = json;

  delete userJSON.password;
  delete userJSON.email;

  userJSON.gravatar = gravatar;
  return userJSON;
}

function getUserById(res, id, includeLibrary){
  var userJSON;
  db.models.User.find(id).success(function(user){
      userJSON = addGravatarAndRemovePasswordEmail(user, user.toJSON()); 
      res.send(userJSON);
  });
};

function getUserLibrary(res, id){
  //console.log(db);
  var sql = "SELECT ue.user_id as user_id, "+
              "ep.anime_id as anime_id, "+
              "ep2.tot as total, "+
              "COUNT(ep.id) as progress " +
            "FROM episodes ep, user_episodes ue, ( "+
              "SELECT e.anime_id as anime_id, COUNT(e.id) as tot " +
              "FROM episodes e " +
              "GROUP BY e.anime_id " +
            ") as ep2 " +
            "WHERE ep.id = ue.episode_id " +
              "AND ep2.anime_id = ep.anime_id " +
              "AND ue.user_id = " + id + " " +
            "GROUP BY ue.user_id, ep.anime_id;";
  db.client.query(sql,null, {raw:true}).success(function(result){
    // Fetch all the ids
    var ids = [], ret = [];
    result.forEach(function(r){
      ids.push(r.anime_id);
    });

    db.models.Anime.findAll({where: {id: ids }}).success(function(animeList){

      result.forEach(function(value, index){
        ret[index] = combineLibraryAnime(value, animeList);
      });
    
      res.send(ret);

    });

  });
}

function combineLibraryAnime(libraryItem, animeList) {
  var anime;
  animeList.forEach(function(a, index){
    if(a.id == libraryItem.anime_id)
      anime = a;
  });
  libraryItem.anime = anime;
  return libraryItem;
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