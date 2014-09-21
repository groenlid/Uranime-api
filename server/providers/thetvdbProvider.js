'use strict';

var Provider = require('./provider'),
	TVDB = require('tvdb'),
	bluebird = require('bluebird'),
	config = require('../config/config'),
	defaultRules = {
    	setIfEmpty: 1,
    	override: 2
    };;

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

TheTVDBProvider.prototype._refreshSingleRemote = function(self, connection){
	return new bluebird(function(resolve, reject){
		self._client.getInfo(connection.siteId, function(err, anime){
			if(err) return reject(err);
			self._remoteAnime[connection.siteId] = anime;
			resolve(anime);
		});
	});
};

module.exports = TheTVDBProvider;