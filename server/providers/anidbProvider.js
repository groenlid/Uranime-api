'use strict';

var config = require('../config/config'),
    anidb = require('anidb'),
    bluebird = require('bluebird'),
    _ = require('lodash'),
    NormalMapper = require('./mappers/anidb/normalMapper'),
    Provider = require('./provider'),
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
	Provider.call(this, uranime_anime);
	this._site = 'anidb';
    this._client = client || new anidb(config.anidb.client, config.anidb.clientVersion);
}

AniDbProvider.prototype = Object.create(Provider.prototype);


AniDbProvider.prototype._refreshSingleRemote = function(self, connection){
	return new bluebird(function(resolve, reject){
		self._client.getAnime(connection.siteId, function(err, anime){
			if(err) return reject(err);
			self._remoteAnime[connection.siteId] = anime;
			resolve(anime);
		});
	});
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
    			mapper = new NormalMapper(self._site);
    		break;
    		default:
    			mapper = new NormalMapper(self._site);
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