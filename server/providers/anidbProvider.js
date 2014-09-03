'use strict';

var config = require('../config/config'),
    anidb = require('anidb'),
    bluebird = require('bluebird');

function AniDbProvider(uranime_anime, client) {
	if(!uranime_anime) throw new Error('You must instanciate the provider with a anime model as the first argument. new AniDbProvider(anime);');

	this._timeoutRequest = 3000;
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
 * It is saved as {connection.siteId: {anime}}.
 * @return {Object} The remote anime dictionary.
 */
AniDbProvider.prototype.refreshRemote = function(){
	var self = this,
		defers = [], 
		defer = bluebird.pending,
		connections = this._getConnections();

	if(connections.length === 0 || this._remoteAnime) {
		defer.resolve();
		return defer.promise;
	}
	
	connections.forEach(function(connection, i){
		var d = bluebird.pending;
		setTimeout(function(){
			self._client.getAnime(connection.siteId, function(anime){
				self._remoteAnime[connection.siteId] = anime;
			});
		}, i * this._timeoutRequest);
		defers.push(d.promise);
	});

	return defers.length === 0 ? defer.promise : bluebird.all(defers);
};

/**
 * Returns the modified referance uranime_anime from the provider.
 * @return {Anime}
 */
AniDbProvider.prototype.returnAnime = function(){
	return this._anime;
};

/**
 * Updates the episodes on the anime object
 * and resolves the promise with the updated
 * anime object. It does not save the model.
 * @returns {defer.promise} Resolves with the anime object
 */
AniDbProvider.prototype.updateEpisodes = function(){
    var defer = bluebird.pending(),
    self = this;

	this.refreshRemote()
	.then(function(){
		console.log('Refreshed the anime... ', self.returnAnime());
	}, defer.reject); 
 
    return defer.promise;
};

module.exports = AniDbProvider;