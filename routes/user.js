
/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.getById = function(req, res){
  var ret;
  db.models.User.find(req.params.id).success(function(user){
    console.log(user);
        var gravatar = user.gravatar(), userJSON = user.toJSON();
        
        delete userJSON.password;
        delete userJSON.email;
        userJSON.gravatar = gravatar;
        res.send(userJSON);
  });
}