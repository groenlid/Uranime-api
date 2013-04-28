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
  var includeQuery = [{model: db.models.Synonym, as: 'Synonyms'}],
      q = req.query.q, 
      qLower = q.toLowerCase();

  db.models.Anime.findAll({
    where: ["lower(Synonyms.title) like ?", '%' + qLower + '%'], 
    include:includeQuery
  }).success(function(anime){
      res.send(anime);
  });
};