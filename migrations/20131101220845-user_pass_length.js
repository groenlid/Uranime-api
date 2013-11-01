module.exports = {
  up: function(migration, DataTypes, done) {
      // add altering commands here, calling 'done' when finished
      migration.changeColumn(
                'users',
                'password',
                {
                    type: DataTypes.STRING,
                    allowNull: false,
                }).then(done);
  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
    done()
  }
}
