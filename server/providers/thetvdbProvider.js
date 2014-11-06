'use strict';

var Provider = require('./provider'),
	TVDB = require('tvdb'),
	bluebird = require('bluebird'),
	config = require('../config/config'),
	SeasonMapper = require('./mappers/thetvdb/seasonMapper'),
	imageController = require('../controllers/images'),
	_ = require('lodash'),
	mongoose = require('mongoose'),
	util = require('util');

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

/**
 * Updates the episodes from the remote. Can either return void or promise async tasks.
 * @param  {object} episodeToUpdate 
 * @param  {object} tvdbEpisode     
 * @param  {object} rules           
 * @return {promise|void}                 
 */
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
	
	if(episodeToUpdate.images.length !== 0) {
		return;
	}

	return this._fetchEpisodeImageAndUpdateReferance(episodeToUpdate, tvdbEpisode);
};

/**
 * This should be redone when thetvdb-node have updated their library 
 * to include episode-image information
 * @param  {episode} episodeToUpdate 
 * @param  {episode} tvdbEpisode     
 * @return {promise}                 
 */
TheTVDBProvider.prototype._fetchEpisodeImageAndUpdateReferance = function(episodeToUpdate, tvdbEpisode){
	var urlForEpisodes = 'http://thetvdb.com/banners/episodes/%s/%s.jpg',
		url = util.format(urlForEpisodes, tvdbEpisode.tvShowId,tvdbEpisode.id);
	return new bluebird(function(resolve, reject){
		imageController.uploadImageFromUrl(url, config.imageCollections.episodeImage).then(function(files){
			episodeToUpdate.images.push(new mongoose.Types.ObjectId(files[0]._id));
		})
		.catch(function(err) {
			console.log('Could not fetch image', err);
		})
		.finally(function(){
			resolve();
		});
	});
};

TheTVDBProvider.prototype._getMapper = function(connection){
	switch(connection.mapping){
		case 'season':
			return new SeasonMapper(connection);
		default:
			return new SeasonMapper(connection);
	}
};

module.exports = TheTVDBProvider;