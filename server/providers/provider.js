'use strict';

var util = require('util'),
	bluebird = require('bluebird'),
	_ = require('lodash'),
	defaultRules = {
    	setIfEmpty: 1,
    	override: 2
    };

/**
 * Provider
 * @param {[type]} uranime_anime
 * @param {[type]} client
 */
function Provider(uranime_anime) {
	if(!uranime_anime) 
		throw new Error(util.format('Missing argument anime. use new `ProviderName`(anime); You sent %s', JSON.stringify(arguments)));

	this._anime = uranime_anime;
    this._actionQueue = [];
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
Provider.prototype.refreshRemote = function(){
	this._actionQueue.push(this._refreshRemote);
	return this;
};

Provider.prototype._refreshRemote = function(){
	var defers = [], 
		connections = this._getConnections(),
		self = this;


	this._remoteAnime = {};	
	
	connections.forEach(function(connection, i){
		defers.push(self._refreshSingleRemote(connection));
	});

	return bluebird.all(defers);

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
 */
Provider.prototype.updateEpisodes = function(){
	this._actionQueue.push(this._updateEpisodes);
	return this;
};

Provider.prototype._updateEpisodes = function(){
    var animeToUpdate = this._anime,
	    connections = this._getConnections(),
	    self = this;

	return new bluebird(function(resolve, reject){
		var promises = [];
		connections.forEach(function(connection){
	    	var remoteAnime = self._returnRemoteAnime(connection),
	    		mapper = self._getMapper(connection);
	    	
	    	remoteAnime.episodes.forEach(function(remoteEpisode){
	    		var localEpisodeToUpdate = mapper.getEpisodeToUpdate(animeToUpdate, remoteEpisode), pendingUpdate;
	    		if(typeof localEpisodeToUpdate === 'undefined') return;
	    		pendingUpdate = self._updateEpisode(localEpisodeToUpdate, remoteEpisode, connection.rules);
	    		if(typeof pendingUpdate !== 'undefined') {
	    			promises.push(pendingUpdate);
	    		}
	    	});

    	});
    	console.log('Update-episode-Promises:', promises);
    	bluebird.all(promises).then(resolve);
	});
};

Provider.prototype._doQueue = function(callback){
	var self = this, action;
	if(this._actionQueue.length === 0)
		return callback();

	action = this._actionQueue.shift();
	action.call(self).then(function(){
		self._doQueue.call(self, callback);
	}, callback);
};

/**
 * Returns the modified referance uranime_anime from the provider.
 * @return {Anime}
 */
Provider.prototype.returnAnime = function(callback){
	var self = this;
	return new bluebird(function(resolve, reject){
		self._doQueue(function(err){
			if(err) {
				if(callback) callback(err);
				reject(err);
				return;
			}
			if(callback) callback(null, self._anime);
			resolve(self._anime);
		});
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