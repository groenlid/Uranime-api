var fs = require('fs')
,   Q = require('q');

module.exports = {
  up: function(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished
    var files = ['user_library.sql'],
        deferlist = [],
        db = migration.migrator.sequelize;

    files.forEach(function(file){
        console.log("Running file: " + file);
        fs.readFile(__dirname + '/database_views/' + file, function(err, data){
          if (err) throw err;
          deferlist.push(db.query(data.toString(), null, {raw: true}));
        });
    });
    Q.all(deferlist).then(function(){
      done();
    });
  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
    done();
  }
};