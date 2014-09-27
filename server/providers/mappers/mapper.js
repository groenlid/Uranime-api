'use strict';

var _ = require('lodash');

function Mapper(connection) {
	this._site = connection.site;
	this._connection = connection;
}

/**
 * Mapper prototypes
 */

Mapper.prototype._findLocalEpisodeByRemoteId = function(animeToSearch, remoteId){
	var site = this._site;

	if(!animeToSearch.episodes) return;

	return _.find(animeToSearch.episodes, function(episode){
		if(!episode.connections) return false;
		var hasConnection = _.find(episode.connections, function(connection){
			return connection.site === site && connection.siteId === remoteId;
		});

		return Boolean(hasConnection);
	});
};

module.exports = Mapper;