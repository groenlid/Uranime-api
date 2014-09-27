'use strict';

var Provider = require('./provider'),
	TVDB = require('tvdb'),
	bluebird = require('bluebird'),
	config = require('../config/config'),
	SeasonMapper = require('./mappers/thetvdb/seasonMapper'),
	_ = require('lodash');

/**
 * Provider
 * @param {[type]} uranime_anime
 * @param {[type]} client
 */
function TheTVDBProvider(uranime_anime, client) {
	Provider.call(this, uranime_anime);
	this._site = 'thetvdb';
    this._client = client || new TVDB({ apiKey: config.thetvdb.key });
}

TheTVDBProvider.prototype = Object.create(Provider.prototype);

TheTVDBProvider.prototype._refreshSingleRemote = function(connection){
	var self = this;
	return new bluebird(function(resolve, reject){
		self._client.getInfo(connection.siteId, function(err, anime){
			if(err) return reject(err);
			self._remoteAnime[connection.siteId] = anime;
			resolve(anime);
		});
	});
};

TheTVDBProvider.prototype._updateEpisode = function(episodeToUpdate, tvdbEpisode, rules){
	rules = rules || {};

	// this._updateEpisodeField('number', episodeToUpdate, anidbEpisode.epno, rules);
	// this._updateEpisodeField('runtime', episodeToUpdate, anidbEpisode.length, rules);
	// this._updateEpisodeField('aired', episodeToUpdate, new Date(anidbEpisode.airdate), rules);
	// this._updateEpisodeField('special', episodeToUpdate, false, rules);
	
	var titleExists = _.find(episodeToUpdate.titles, function(localTitle){
		return localTitle.title === tvdbEpisode.name;
	});
	
	if(!titleExists){
		var newTitle = episodeToUpdate.titles.create({title: tvdbEpisode.name, lang: tvdbEpisode.language});
		episodeToUpdate.titles.push(newTitle);
	}

	this._addConnectionOnEpisode(episodeToUpdate, tvdbEpisode);
};

TheTVDBProvider.prototype._getMapper = function(connection){
	switch(connection.mapping){
		case 'season':
			return new SeasonMapper(connection);
		break;
		default:
			return new SeasonMapper(connection);
		break;
	}
};

module.exports = TheTVDBProvider;