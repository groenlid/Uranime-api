module.exports = {
  up: function(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished

	var db = migration.migrator.sequelize;
    db.options.logging = console.log;
    
    // Create the new tables...
    var createLists = function(){
    	return migration.createTable('privateEntries',
		{
    		id: {
    			type: DataTypes.INTEGER,
    			primaryKey: true,
    			autoIncrement: true
    		},
    		createdAt: {
    			type: DataTypes.DATE,
    			defaultValue: DataTypes.NOW
    		},
    		user_id: {
    			type: DataTypes.INTEGER,
    			allowNull: false
    		},
    		anime_id: {
    			type: DataTypes.INTEGER,
    			allowNull: false
    		},
    		is_private: {
    			type: DataTypes.BOOLEAN,
    			defaultValue: false
    		}
    	},{
    		timestamps: true,
    		paranoid: false,
        	underscored: true
    	});
	};

	var createUniqueIndex = function(){
		return migration.addIndex(
	  		'privateEntries',
	  		['user_id', 'anime_id'],
	  		{
	    		indicesType: 'UNIQUE'
	  		}
		);
	}

	createLists().success(function(){
        createUniqueIndex().success(done)
        }
    );
  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
    done()
  }
}