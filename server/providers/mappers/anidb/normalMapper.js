'use strict';

var Mapper = require('../mapper'),
	_ = require('lodash');

function NormalMapper() {}


NormalMapper.prototype = new Mapper();


NormalMapper.prototype._findLocalEpisode = function(animeToSearch, remoteEpisode){
	return  this._findLocalEpisodeByRemoteId(animeToSearch, remoteEpisode.id) || 
			_.find(animeToSearch.episodes, function(episode){
				return episode.number === remoteEpisode.epno;
			});
};


NormalMapper.prototype.getEpisodeToUpdate = function(animeToUpdate, remoteEpisode){
	if(remoteEpisode.type !== 1) return; // Type 1 == Regular episode.

	var localEpisode = this._findLocalEpisode(animeToUpdate, remoteEpisode);
	
	if(!localEpisode){
		localEpisode = animeToUpdate.episodes.create({});
		animeToUpdate.episodes.push(localEpisode);
	}
	return localEpisode;
};

module.exports = NormalMapper;