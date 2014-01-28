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
                }).then(done);

      // Scramble the passwords
      db.query('UPDATE users SET password="?"', null, {raw:true}, [1]));

  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
    done()
  }
}
