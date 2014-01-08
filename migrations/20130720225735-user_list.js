/*
 * This should give the user the ability to create his/hers own lists.
 * There should exist a table called user_watchlist before this is run.
 */

module.exports = {
  up: function(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished
    var db = migration.migrator.sequelize;
    db.options.logging = console.log;
    
    // Create the new tables...
    var createLists = function(){
    	return migration.createTable('lists',
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

	var createListEntries = function(){
		return migration.createTable('listEntries',
    	{
    		id: {
    			type: DataTypes.INTEGER,
    			primaryKey: true,
    			autoIncrement: true
    		},
    		anime_id: DataTypes.INTEGER,
    		list_id: DataTypes.INTEGER,
    		createdAt: {
    			type: DataTypes.DATE,
    			defaultValue: DataTypes.NOW
    		}
    	},{
    		timestamps: true,
    		paranoid: false,
    		underscored: true
    	});
	};

	var removeWatchlist = function(){
		migration.dropTable('user_watchlist');
	};



	// Migrate over the old data.
	var migrateData = function(db){
		var i = db.query("SELECT * FROM user_watchlist");
        i.success(function(data){

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
        return i;
	};

	createLists().success(function(){
        createListEntries().success(function(){
            migrateData(db).success(function(){
                removeWatchlist();
                done(); 
            });    
        });
    })
    
  },
  down: function(migration, DataTypes, done) {
  }
}