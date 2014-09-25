'use strict';

var Provider = require('./provider'),
	TVDB = require('tvdb'),
	bluebird = require('bluebird'),
	config = require('../config/config'),
	SeasonMapper = require('./mappers/thetvdb/seasonMapper');

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

TheTVDBProvider.prototype._getMapper = function(connection){
	switch(connection.mapping){
		case 'season':
			return new SeasonMapper(this._site);
		break;
		default:
			return new SeasonMapper(this._site);
		break;
	}
};

module.exports = TheTVDBProvider;