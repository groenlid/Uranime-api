module.exports = function(param){
    var db = param.db
    var models = db.models
    /*
    * GET home page.
    */
    return {
        index : function(req, res){
            console.log(models);
            models.Anime.find(1).success(function(c){
                res.json(c,200);    
                console.log("There are" + c.title + " animes in the database");
            });
            //res.render('index', { title: 'Express' })
        }
    }
}
