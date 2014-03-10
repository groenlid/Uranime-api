module.exports = {
    up: function(migration, DataTypes, done) {
        var db = migration.migrator.sequelize,
            Q = require('q'),
            outerDeferreds = [
                Q.defer(),
                Q.defer()
                ],
            that;

        db.options.logging = console.log;

        migration.addColumn(
            'anime',
            'episode_count',
            {
                type: DataTypes.INTEGER,
                allowNull: false,
                default: 0
            }
        ).success(function(){
            db.query('SELECT COUNT(*) as episodecount, anime_id FROM episodes GROUP BY anime_id').success(function(episodecount){
                var deferlist = [];

                episodecount.forEach(function(item){
                    deferlist.push(db.query('UPDATE `anime` SET `episode_count`=? WHERE `id`=?', null, {raw:true}, [item.episodecount, item.anime_id]));
                });
                Q.all(deferlist).then(function(){
                    outerDeferreds[0].resolve();                   
                });
            });
        });

        migration.addColumn(
            'episodes',
            'runtime',
            {
                type: DataTypes.INTEGER,
                allowNull: false,
                default: 0
            }
        ).success(function(){
            db.query('SELECT id, runtime FROM anime').success(function(animelist){

                var deferlist = [];
                console.log(animelist);
                animelist.forEach(function(anime){
                    deferlist.push(db.query('UPDATE `episodes` SET `runtime`=? WHERE `anime_id`=?', null, {raw:true}, [anime.runtime, anime.id]));
                });
                Q.all(deferlist).then(function(){
                    outerDeferreds[1].resolve();
                });
            });
        });

        outerDeferreds.push(migration.removeColumn('anime', 'runtime'));

        Q.all(outerDeferreds).then(function(){
            done();
        });
  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
    //done();
  }
};
