'use strict';

var util = require('util'),
	bluebird = require('bluebird'),
	_ = require('lodash'),
	defaultRules = {
    	setIfEmpty: 1,
    	override: 2
    };;

/**
 * Provider
 * @param {[type]} uranime_anime
 * @param {[type]} client
 */
function Provider(uranime_anime) {
	if(!uranime_anime) 
		throw new Error(util.format('Missing argument anime. use new `ProviderName`(anime); You sent %s', JSON.stringify(arguments)));

	this._anime = uranime_anime;
}

/**
 * Returns the connection objects on the anime
 * associated with this provider.
 * @return {Array} An array with connection models
 */
Provider.prototype._getConnections = function(){
	var connectionId = this._site;
	if(!this._site) throw new Error('Missing attribute `site` on the provider');
	return this._anime.connections.filter(function(connection){
		return connection.site === connectionId;
	});
};

/** 
 * Internal method.
 * Returns the remote cache for the anime associated with the given connection. 
 */
Provider.prototype._returnRemoteAnime = function(connection){
	if(typeof this._remoteAnime === 'undefined')
		throw new Error('The remote cache is empty. Did you forget to call `refreshRemote()` on the provider?');
	return this._remoteAnime[connection.siteId];
};


/**
 * Fetches the remote anime from the connections and
 * assigns it on the object as this._remoteAnime.
 * It is saved as {connection.siteId: {anime}}.
 * @return {Object} The remote anime dictionary.
 */
Provider.prototype.refreshRemote = function(self){
	self = self || this;
	var defers = [], 
		defer = bluebird.pending(),
		connections = self._getConnections();
	
	self._remoteAnime = {};	
	
	connections.forEach(function(connection, i){
		defers.push(self._refreshSingleRemote(self, connection));
	});

	bluebird.all(defers).then(function(){
		defer.resolve(self);
	});

	return defer.promise;
};

Provider.prototype._updateEpisodeField = function(field, episodeToUpdate, remoteField, rules){
	var rule = (rules === undefined) ? rule[field] : defaultRules.setIfEmpty;

	switch(rule){
		case defaultRules.setIfEmpty:
			episodeToUpdate[field] = episodeToUpdate[field] || remoteField;
		break;
		case defaultRules.override:
			episodeToUpdate[field] = remoteField;
		break;
	}
};

/**
 * Updates the episodes on the anime object
 * and resolves the promise with the updated
 * anime object. It does not save the model.
 * @returns {defer.promise} Resolves with the anime object
 */
Provider.prototype.updateEpisodes = function(self){
    self = self || this;
    
    var defer = bluebird.pending(),
	    animeToUpdate = self._anime,
	    connections = self._getConnections();

    connections.forEach(function(connection){
    	var remoteAnime = self._returnRemoteAnime(connection),
    		mapper = self._getMapper(connection);
    	
    	
    	remoteAnime.episodes.forEach(function(remoteEpisode){
    		var localEpisodeToUpdate = mapper.getEpisodeToUpdate(animeToUpdate, remoteEpisode);
    		if(!localEpisodeToUpdate) return;
    		self._updateEpisode(localEpisodeToUpdate, remoteEpisode, connection.rules);
    	});

    });

 	defer.resolve(self);
    return defer.promise;
};

/**
 * Returns the modified referance uranime_anime from the provider.
 * @return {Anime}
 */
Provider.prototype.returnAnime = function(self){
	self = self || this;
	return new bluebird(function(resolve, reject){
		resolve(self._anime);
	});
};

Provider.prototype._addConnectionOnEpisode = function(episodeToUpdate, remoteEpisode){
	if(this._episodeContainSiteConnection(episodeToUpdate, this._site)) return;

	var connection = episodeToUpdate.connections.create({
		siteId: remoteEpisode.id,
		site: this._site
	});
	episodeToUpdate.connections.push(connection);
};

Provider.prototype._episodeContainSiteConnection = function(animeEpisode, site){
	return _.chain(animeEpisode.connections).pluck('site').contains(site).valueOf();
};

module.exports = Provider;