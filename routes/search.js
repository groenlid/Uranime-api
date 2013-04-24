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
  var q = req.query.q, qLower = q.toLowerCase();
  db.models.Anime.findAll({
    where: ["lower(anime_synonyms.title) like ?", '%' + qLower + '%'], 
    include:['Synonyms']
  }).success(function(anime){
    var chainer = new Sequelize.Utils.QueryChainer,
    _anime  = [];
    anime.forEach(function(a) {
      var emitter = new Sequelize.Utils.CustomEventEmitter(function() {
        a.getSynonyms().on('success', function(s) {
          var ajson = a.toJSON();
          ajson.synonyms = s;
          _anime.push(ajson);
          emitter.emit('success')
        });
      });
      chainer.add(emitter.run());
    });
    
    chainer.run().on('success', function() {
      res.send(_anime);
    });
  });

};