'use strict';

var _ = require('lodash');

function Mapper(siteId) {
	this._connectionId = siteId;
}

/**
 * Mapper prototypes
 */

Mapper.prototype._findLocalEpisodeByRemoteId = function(animeToSearch, remoteId){
	var connectionId = this._connectionId;

	if(!animeToSearch.episodes) return;

	return _.find(animeToSearch.episodes, function(episode){
		if(!episode.connections) return false;
		var hasConnection = _.find(episode.connections, function(connection){
			return connection.site === connectionId && connection.siteId === remoteId;
		});

		return Boolean(hasConnection);
	});
};

module.exports = Mapper;