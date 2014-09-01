'use strict';

var config = require('../config/config'),
    anidb = require('anidb'),
    bluebird = require('bluebird');

function AniDbProvider(uranime_anime, client) {
	if(!uranime_anime) throw new Error('You must instanciate the provider with a anime model as the first argument. new AniDbProvider(anime);');

	this._connectionId = 'anidb';
	this._anime = uranime_anime;
    this._client = client || new anidb(config.anidb.client, config.anidb.clientVersion);
}

/**
 * Returns the connection objects on the anime
 * associated with this provider.
 * @return {Array} An array with connection models
 */
AniDbProvider.prototype._getConnections = function(){
	var connectionId = this._connectionId;
	return this._anime.connections.filter(function(connection){
		return connection.site === connectionId;
	});
};

/**
 * Fetches the remote anime from the connections and
 * assigns it on the object as this._remoteAnime.
 * It is saved as {connection.site_id: {anime}}.
 * @return {Object} The remote anime dictionary.
 */
AniDbProvider.prototype._refreshRemoteAnime = function(){
	var connections = this._getConnections();
	if(connections.length === 0) return {};
	
};

/**
 * Updates the episodes on the anime object
 * and resolves the promise with the updated
 * anime object. It does not save the model.
 * @returns {defer.promise} Resolves with the anime object
 */
AniDbProvider.prototype.updateEpisodes = function(){
    var defer = bluebird.pending(),
    connections = this._getConnections(),
    localAnime = this._anime;

    if(connections.length === 0)
    	return;

    connections.forEach(function(connection){

    });
    /*this._client.getAnime(this._anime.id, function(err, anime){
    	console.log(anime);
    	defer.resolve(localAnime);
    });*/

    return defer.promise;
};

module.exports = AniDbProvider;