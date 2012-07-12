module.exports = function(sequelize, DataTypes) {
    var Anime = sequelize.define("anime", {
            id: { 
                type: DataTypes.INTEGER, 
                primaryKey: true
                },
            title: DataTypes.STRING,
            desc: DataTypes.TEXT,
            });
    return Anime;
}
