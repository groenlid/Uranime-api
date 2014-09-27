'use strict';

var Mapper = require('../mapper'),
	_ = require('lodash');

function SeasonMapper(connection) {
	Mapper.call(this, connection);
}

SeasonMapper.prototype = Object.create(Mapper.prototype);

SeasonMapper.prototype._findLocalEpisode = function(animeToSearch, remoteEpisode, seasonToFetch){
	return  this._findLocalEpisodeByRemoteId(animeToSearch, remoteEpisode.id) || 
			_.find(animeToSearch.episodes, function(episode){
				return episode.number === parseInt(remoteEpisode.number,10);
			});
};


SeasonMapper.prototype.getEpisodeToUpdate = function(animeToUpdate, remoteEpisode){
	var seasonToFetch = this._connection.season;
	if(typeof seasonToFetch === 'undefined' || remoteEpisode.season !== seasonToFetch) return;

	var localEpisode = this._findLocalEpisode(animeToUpdate, remoteEpisode, seasonToFetch);
	
	if(!localEpisode){
		localEpisode = animeToUpdate.episodes.create({});
		animeToUpdate.episodes.push(localEpisode);
	}
	return localEpisode;
};

module.exports = SeasonMapper;