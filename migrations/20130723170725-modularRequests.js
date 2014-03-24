
//# THIS IS NOT DONE.
module.exports = {
  up: function(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished
    var Q = require('q');
    var db = migration.migrator.sequelize;
    db.options.logging = console.log;
    
    // Create the new tables...
    var createTables = function(){
        var deferlist = [];

        deferlist.push(migration.createTable('requests',
		{
            id: {
    			type: DataTypes.INTEGER,
    			primaryKey: true,
    			autoIncrement: true
    		},
    		createdAt: {
    			type: DataTypes.DATE,
                allowNull: false,
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
    	}));

    	deferlist.push(migration.createTable('connections',
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
    		site_id: {
    			type: DataTypes.INTEGER,
    			allowNull: false
    		},
            source_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            anime_id: {
                type: DataTypes.INTEGER,
                allowNull: true
    		},
    		request_id: {
    			type: DataTypes.INTEGER,
    			allowNull: true
            },
            episode_id: {
                type: DataTypes.INTEGER,
                allowNull: true
            }
        },{
            timestamps: true,
            paranoid: false,
            underscored: true
    	}));

        deferlist.push(migration.createTable('connectionAttributes',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            connection_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            connectiontype_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            comment: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            value: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            rank: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },
            updatedAt: {
                type: DataTypes.DATE
            },
        }));
    	
        deferlist.push(migration.createTable('sites',
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
    		show_link_url: {
    			type: DataTypes.STRING,
    			allowNull: false
    		},
            episode_link_url: {
                type:DataTypes.STRING,
                allowNull: true
            }
    	}));

    	deferlist.push(migration.createTable('connectionAttributeTypes',
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
    	}));
        return deferlist;
	};
    
    var dropTable = function(){
        //return migration.dropTable('anime_request');
    };
    
    var addDefaultSites = function(db){
        var sites = [
            ['1', 'aniDB', 'AniDB stands for Anime DataBase. AniDB is a non-profit anime database that is open freely to the public.', 'http://anidb.net','http://anidb.net/perl-bin/animedb.pl?show=anime&aid=','http://anidb.net/perl-bin/animedb.pl?show=ep&eid='],
            ['2', 'myanimelist', 'MyAnimeList.net was created by an anime fan, for anime fans. It was designed from the ground up to give the user a quick and no-hassle way to catalog their anime or manga collection. Over 40,000 users sign in every day to help build the world\'s largest social anime and manga database and community.', 'http://myanimelist.net', 'http://myanimelist.net/anime/',''],
            ['3', 'TheTVDB.com', 'TheTVDB is an open database that can be modified by anybody.', 'http://thetvdb.com', 'http://thetvdb.com/?tab=series&id=',''],
            ['4', 'themoviedb.org', 'themoviedb.org is a free and community maintained movie database.','http://themoviedb.org', 'http://www.themoviedb.org/movie/','']
        ];

        /*var connectiontypes = [
            ['1', 'Episodes', 'Fetches a single episode or multiple episodes from a site'],
            ['2', 'Specials', 'Fetches the special episodes'],
        ];*/

        var deferList = [];
        sites.forEach(function(site){
            deferList.push(db.query(
                'INSERT INTO sites (`id`,`name`, `description`, `url`, `show_link_url`, `episode_link_url`) VALUES (?,?,?,?,?,?)', 
                null, 
                {raw:true}, 
                site
            ));    
        });

        /*connectiontypes.forEach(function(type){
            db.query(
                'INSERT INTO connectionAttributeTypes (`id`,`type`, `description`) VALUES (?,?,?)', 
                null, 
                {raw:true}, 
                type
            );    
        });*/

        return deferList;
    };

    var moveFromScrapeInfoToNew = function(db){
        var siteMapping = {
            'thetvdb':3,
            'mal':2,
            'anidb':1,
            'themoviedb': 4
        };

        var catMapping = {
            'Episodes': 1,
            'Specials': 2,
            'Information': 3
        };

        var manuelEpisodeList = [
            ['1', '154841', '29656'],
            ['1', '154852', '29657'],
            ['1', '155102', '29658'],
            ['1', '155101', '29664'],
            ['1', '155965', '29663'],
            ['1', '155965', '29976'],
            ['1', '156033', '30072'],
            ['1', '156306', '30117'],
            ['1', '156460', '30150'],
            ['1', '156461', '30178'],
            ['1', '156625', '30242'],
            ['1', '156733', '30282'],
            ['1', '156825', '30328'],
            ['1', '157097', '30426'],
            ['1', '157365', '30739']
        ];

        var defer = Q.defer();
        db.query('SELECT * FROM scrape_info').success(function(data){
            var deferlist = [];
            data.forEach(function(row){
                deferlist.push(db.query('INSERT INTO connections (`site_id`,`source_id`,`anime_id`) VALUES (?,?,?)',
                null,
                {raw: true},
                [siteMapping[row.scrape_source], row.scrape_id, row.anime_id])       
            )});
            
            manuelEpisodeList.forEach(function(row){
                deferlist.push(db.query('INSERT INTO connections (`site_id`,`source_id`,`episode_id`) VALUES(?,?,?)', null, {raw:true}, row));
            });
            
            Q.all(deferlist).then(function(){
                defer.resolve();
            })
        });
        return defer.promise;
    };

    Q.all(createTables()).then(function(){
        Q.all(addDefaultSites(db)).then(function(){
            moveFromScrapeInfoToNew(db).then(function(){
                dropTable();
                done();     
            });
        });
    });
    
    
  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
    done()
  }
}