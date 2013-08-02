# THIS IS NOT DONE.
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

	var removeWatchlist = function(){
		migration.dropTable('user_watchlist');
	};



	// Migrate over the old data.
	var migrateData = function(db){
		db.query("SELECT * FROM user_watchlist").success(function(data){

			var users = [];
			
			var fillWithEntries = function(db, user_id, list_id){
				data.forEach(function(item){
					if(item.user_id !== user_id) return;

					db.query(
						'INSERT INTO listEntries (`anime_id`, `list_id`, `createdAt`) VALUES (?,?,?)', 
						null, 
						{raw:true}, 
						[item.anime_id, list_id, item.time]
					);

				});
			};

			var createWatchlistAndFill = function(db, user_id){
				db.query(
						'INSERT INTO lists (`user_id`, `title`,`createdAt`) VALUES (?,?,NOW())', 
						null, 
						{raw:true}, 
						[user_id,'watchlist']
					).success(function(){
						db.query(
							'SELECT id FROM lists WHERE `user_id`=? AND `title`=?', 
							null, 
							{raw:true},
							[user_id,'watchlist']
						).success(function(id){
							fillWithEntries(db,user_id, id[0].id);
						});
					});
			};


			data.forEach(function(item){
				// Iterate through the data once, to find all the user id's.
				if(users.indexOf(item.user_id) !== -1) return;
				
				users.push(item.user_id);

				createWatchlistAndFill(db, item.user_id);

			});

		});
	}

	createLists();
	createListEntries();
	migrateData(db);
    removeWatchlist();
    done()
  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
    done()
  }
}
