'use strict';

var config = require('../config/config'),
    anidb = require('anidb'),
    bluebird = require('bluebird'),
    util = require('util'),
    _ = require('lodash'),
    rules = {
    	setIfEmpty: 1,
    	override: 2
    };

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
AniDbProvider.prototype.refreshRemote = function(self){
	var self = self || this,
		defers = [], 
		defer = bluebird.pending(),
		connections = self._getConnections();
	
	self._remoteAnime = {};
	
	connections.forEach(function(connection, i){
		defers.push(new bluebird(function(resolve, reject){
			setTimeout(function(){
				self._client.getAnime(connection.siteId, function(err, anime){
					if(err) return reject(err);
					self._remoteAnime[connection.siteId] = anime;
					resolve(anime);
				});
			}, i * self._timeoutRequest);
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
	var self = self || this;
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
    var self = self || this,
    defer = bluebird.pending(),
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
	var rule = (rules === undefined) ? rule[field] : rules.setIfEmpty;

	switch(rule){
		case rules.setIfEmpty:
			episodeToUpdate[field] = episodeToUpdate[field] || anidbField;
		break;
		case rules.override:
			episodeToUpdate[field] = anidbField;
		break;
	}
};

AniDbProvider.prototype._updateEpisode = function(episodeToUpdate, anidbEpisode, rules){

	rules = rules || {};

	this._updateEpisodeField('number', episodeToUpdate, anidbEpisode.epno, rules);
	this._updateEpisodeField('runtime', episodeToUpdate, anidbEpisode.length, rules);
	this._updateEpisodeField('aired', episodeToUpdate, anidbEpisode.airdate, rules);
	this._updateEpisodeField('special', episodeToUpdate, anidbEpisode.type === 2, rules);
	
	var title = _.find(anidbEpisode.titles, function(title){
		return title.lang === 'en'; 
	});
	
	if(title) this._updateEpisodeField('title', episodeToUpdate, title.title, rules);
	
	if(!episodeToUpdate.titles) episodeToUpdate.titles = [];

	anidbEpisode.titles.forEach(function(title){
		
		var exists = _.find(episodeToUpdate.titles, function(localTitle){
			return localTitle.title === title.title && title.lang == localTitle.lang;
		})

		if(!exists)
			episodeToUpdate.titles.push(title);
	});
};

/**
 * Mappers
 */
function Mapper(siteId) {
	this._connectionId = siteId;
};

Mapper.prototype._findLocalEpisodeByRemoteId = function(animeToSearch, remoteId){
	var self = this,
		connectionId = this._connectionId;

	if(!animeToSearch.episodes) return;

	return _.find(animeToSearch.episodes, function(episode){
		if(!episode.connections) return false;
		var hasConnection = _.find(episode.connections, function(connection){
			return connection.site === connectionId && connection.siteId === remoteId;
		});

		return Boolean(hasConnection);
	});
};

NormalMapper.prototype = new Mapper();
function NormalMapper() {}

NormalMapper.prototype._findLocalEpisode = function(animeToSearch, remoteEpisode){
	if(remoteEpisode.type === 2) return; // Type 2 == Special episode.

	return  this._findLocalEpisodeByRemoteId(animeToSearch, remoteEpisode.id) || 
			_.find(animeToSearch.episodes, function(episode){
				return episode.number === remoteEpisode.epno && episode.special === (remoteEpisode.type === 2);
			});
};


NormalMapper.prototype.getEpisodeToUpdate = function(animeToUpdate, remoteEpisode){
	var localEpisode =  this._findLocalEpisode(animeToUpdate, remoteEpisode);
	
	if(!localEpisode){
		localEpisode = {};
		animeToUpdate.episodes.push(localEpisode);
	}
	return localEpisode;
};


module.exports = AniDbProvider;