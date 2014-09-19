'use strict';

var config = require('../config/config'),
    anidb = require('anidb'),
    bluebird = require('bluebird'),
    _ = require('lodash'),
    NormalMapper = require('./mappers/anidb/normalMapper'),
    defaultRules = {
    	setIfEmpty: 1,
    	override: 2
    };

/**
 * Provider
 * @param {[type]} uranime_anime
 * @param {[type]} client
 */
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
 * It is saved as {connection.siteId: {anime}}.
 * @return {Object} The remote anime dictionary.
 */
AniDbProvider.prototype.refreshRemote = function(self){
	self = self || this;
	var defers = [], 
		defer = bluebird.pending(),
		connections = self._getConnections();
	
	self._remoteAnime = {};
	
	connections.forEach(function(connection, i){
		//bluebird.promisify
		defers.push(new bluebird(function(resolve, reject){
			self._client.getAnime(connection.siteId, function(err, anime){
				if(err) return reject(err);
				self._remoteAnime[connection.siteId] = anime;
				resolve(anime);
			});
		}));
	});

	bluebird.all(defers).then(function(){
		defer.resolve(self);
	});

	return defer.promise;
};

/**
 * Returns the modified referance uranime_anime from the provider.
 * @return {Anime}
 */
AniDbProvider.prototype.returnAnime = function(self){
	self = self || this;
	return new bluebird(function(resolve, reject){
		resolve(self._anime);
	});
};

/** 
 * Internal method.
 * Returns the remote cache for the anime associated with the given connection. 
 */
AniDbProvider.prototype._returnRemoteAnime = function(connection){
	if(typeof this._remoteAnime === 'undefined')
		throw new Error('The remote cache is empty. Did you forget to call `refreshRemote()` on the provider?');
	return this._remoteAnime[connection.siteId];
};

/**
 * Updates the episodes on the anime object
 * and resolves the promise with the updated
 * anime object. It does not save the model.
 * @returns {defer.promise} Resolves with the anime object
 */
AniDbProvider.prototype.updateEpisodes = function(self){
    self = self || this;
    
    var defer = bluebird.pending(),
	    animeToUpdate = self._anime,
	    connections = self._getConnections();

    connections.forEach(function(connection){
    	var remoteAnime = self._returnRemoteAnime(connection),
    		mapper;
    	
    	switch(connection.mapping){
    		case 'normal':
    			mapper = new NormalMapper(self._connectionId);
    		break;
    		default:
    			mapper = new NormalMapper(self._connectionId);
    		break;
    	}
    	remoteAnime.episodes.forEach(function(remoteEpisode){
    		var localEpisodeToUpdate = mapper.getEpisodeToUpdate(animeToUpdate, remoteEpisode);
    		if(!localEpisodeToUpdate) return;
    		self._updateEpisode(localEpisodeToUpdate, remoteEpisode, connection.rules);
    	});

    });

 	defer.resolve(self);
    return defer.promise;
};

AniDbProvider.prototype._updateEpisodeField = function(field, episodeToUpdate, anidbField, rules){
	var rule = (rules === undefined) ? rule[field] : defaultRules.setIfEmpty;

	switch(rule){
		case defaultRules.setIfEmpty:
			episodeToUpdate[field] = episodeToUpdate[field] || anidbField;
		break;
		case defaultRules.override:
			episodeToUpdate[field] = anidbField;
		break;
	}
};

AniDbProvider.prototype._episodeContainSiteConnection = function(animeEpisode, site){
	return _.chain(animeEpisode.connections).pluck('site').contains(site);
};

AniDbProvider.prototype._addConnectionOnEpisode = function(episodeToUpdate, anidbEpisode){
	if(this._episodeContainSiteConnection(episodeToUpdate, 'anidb')) return;

	var connection = episodeToUpdate.connections.create({
		siteId: anidbEpisode.id,
		site: 'anidb'
	});
	episodeToUpdate.connections.push(connection);
};

AniDbProvider.prototype._updateEpisode = function(episodeToUpdate, anidbEpisode, rules){
	rules = rules || {};

	this._updateEpisodeField('number', episodeToUpdate, anidbEpisode.epno, rules);
	this._updateEpisodeField('runtime', episodeToUpdate, anidbEpisode.length, rules);
	this._updateEpisodeField('aired', episodeToUpdate, new Date(anidbEpisode.airdate), rules);
	this._updateEpisodeField('special', episodeToUpdate, false, rules);
	
	anidbEpisode.titles.forEach(function(title){
		
		var exists = _.find(episodeToUpdate.titles, function(localTitle){
			return localTitle.title === title.title;
		});

		if(!exists){
			var newTitle = episodeToUpdate.titles.create(title);
			episodeToUpdate.titles.push(newTitle);
		}
	});

	this._addConnectionOnEpisode(episodeToUpdate, anidbEpisode);
};





module.exports = AniDbProvider;