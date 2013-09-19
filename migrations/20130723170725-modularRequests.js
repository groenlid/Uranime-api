
//# THIS IS NOT DONE.
module.exports = {
  up: function(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished
    
    var db = migration.migrator.sequelize;
    db.options.logging = console.log;
    
    // Create the new tables...
    var createTables = function(){
    	migration.createTable('requests',
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
    		updatedAt: {
    			type: DataTypes.DATE
    		},
    		user_id: {
    			type: DataTypes.INTEGER,
    			allowNull: false
    		},
    		title: {
    			type: DataTypes.STRING,
    			allowNull: false
    		},
    		comment: {
    			type: DataTypes.TEXT,
    			allowNull: true
    		}
    	},{
    		timestamps: true,
    		paranoid: false,
        	underscored: true
    	});

    	migration.createTable('anime_connections',
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
    		updatedAt: {
    			type: DataTypes.DATE
    		},
    		comment: {
    			type: DataTypes.TEXT,
    			allowNull: true
    		},
    		site_id: {
    			type: DataTypes.INTEGER,
    			allowNull: false
    		},
    		anime_id: {
    			type: DataTypes.INTEGER,
    			allowNull: true
    		},
    		requests_id: {
    			type: DataTypes.INTEGER,
    			allowNull: true
    		},
    	},{
    		timestamps: true,
    		paranoid: false,
        	underscored: true
    	});

    	migration.createTable('sites',
		{
    		id: {
    			type: DataTypes.INTEGER,
    			primaryKey: true,
    			autoIncrement: true
    		},
    		name: {
    			type: DataTypes.STRING,
    			allowNull: false
    		},
    		description: {
    			type: DataTypes.TEXT,
    			allowNull: true
    		},
    		url: {
    			type: DataTypes.STRING,
    			allowNull: false
    		},
    		link_id: {
    			type: DataTypes.STRING,
    			allowNull: false
    		}
    	});

    	migration.createTable('connections',
		{
    		id: {
    			type: DataTypes.INTEGER,
    			primaryKey: true,
    			autoIncrement: true
    		},
    		value: {
    			type: DataTypes.STRING,
    			allowNull: false
    		},
    		connectiontype_id: {
    			type: DataTypes.INTEGER,
    			allowNull: false
    		}
    	});

    	migration.createTable('connectionTypes',
		{
    		id: {
    			type: DataTypes.INTEGER,
    			primaryKey: true,
    			autoIncrement: true
    		},
    		type: {
    			type: DataTypes.STRING,
    			allowNull: false
    		},
    		description: {
    			type: DataTypes.TEXT,
    			allowNull: true
    		}
    	});
	};

    var dropTable = function(){
        return migration.dropTable('anime_request');
    };
      
    createTables();
    dropTable();
    done()
  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
    done()
  }
}