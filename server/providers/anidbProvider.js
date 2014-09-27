'use strict';

var config = require('../config/config'),
    anidb = require('anidb'),
    bluebird = require('bluebird'),
    _ = require('lodash'),
    NormalMapper = require('./mappers/anidb/normalMapper'),
    Provider = require('./provider');



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


AniDbProvider.prototype._refreshSingleRemote = function(connection){
	var self = this;
	return new bluebird(function(resolve, reject){
		self._client.getAnime(connection.siteId, function(err, anime){
			if(err) return reject(err);
			self._remoteAnime[connection.siteId] = anime;
			resolve(anime);
		});
	});
};

AniDbProvider.prototype._getMapper = function(connection){
	switch(connection.mapping){
		case 'normal':
			return new NormalMapper(connection);
		default:
			return new NormalMapper(connection);
	}
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