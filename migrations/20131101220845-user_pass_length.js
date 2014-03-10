module.exports = {
  up: function(migration, DataTypes, done) {
      var db = migration.migrator.sequelize;
      db.options.logging = console.log;
      // add altering commands here, calling 'done' when finished
      migration.changeColumn(
        'users',
        'password',
        {
            type: DataTypes.STRING,
            allowNull: false,
        }).then(function(){
          // Scramble the passwords and emails
          db.query('UPDATE users SET email="?", password="?"', null, {raw:true}, ["test@test.com",1]).success(function(){
            done();
          });
        });

  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
    done();
  }
};
