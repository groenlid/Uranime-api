  
  var Sequelize = require('sequelize')

  module.exports = function(options){
    var database;
    database = {
      options: options
    }
    database.module = Sequelize;
    database.client = new Sequelize(options.table, options.username, options.password, {
          host: options.host,
          port: options.port,
          logging: options.logging,
          dialect: 'mysql',
          maxConcurrentQueries: 4,
          pool: { maxConnections: 4, maxIdleTime: 5000 },
          define: {
            timestamps: false,
            freezeTableName: true,
            underscored: true,
            syncOnAssociation: false // to not automaticly create tables.. Can be a bitch..
          }
        });

     /*
      @type {Object}
      Map all attributes of the registry
      (Instance method useful to every sequelize.Table)
      @this {SequelizeRegistry}
      @return {Object} All attributes in a Object
    */

    database.map = function() {
      var ctx, obj,
        _this = this;
      obj = {};
      ctx = this;
      ctx.attributes.forEach(function(attr) {
        return obj[attr] = ctx[attr];
      });
      return obj;
    };
    database.models = require('./models')(database.client);
    return database;
  
};