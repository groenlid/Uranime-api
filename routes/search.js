/*
 * GET search listing.
 */
var Sequelize = require('sequelize');

exports.doSearch = function(req, res){
  var query = req.query, q = query.q, tag = query.tag;
  if(typeof q !== "undefined")
    return exports.getBySearchQuery(req,res);
};

exports.getBySearchQuery = function(req, res){
  var includeQuery = [db.models.Synonym],
      q = req.query.q, 
      qLower = q.toLowerCase();

  db.models.Anime.findAll({
    where: ["lower(anime_synonyms.title) like ?", '%' + qLower + '%'], 
    include:includeQuery
  }).success(function(anime){
      res.send(anime);
  });
};