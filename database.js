    var database = {};
    
    var Sequelize = require('sequelize');
    var db_config = require(__dirname + '/config/database.json');
    
    database.module = Sequelize;
    // Database initialization
    database.client = new Sequelize( 
            db_config.dbBase, 
            db_config.dbUser, 
            db_config.dbPass, 
            {
                host: db_config.dbServer,
                define: 
                {
                    freezeTableName: true,
                    timestamps: false, //define() specific options
                    underscore: true,
                }
            }
    );
    database.models = {};
    database.models.Anime = database.client.import(__dirname + '/models/Anime');

    var self = module.exports = {
        'db' : database
    }

