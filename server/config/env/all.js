'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/../../..');

module.exports = {
	root: rootPath,
	port: process.env.PORT || 3000,
	hostname: process.env.HOST || process.env.HOSTNAME,
	db: process.env.MONGOHQ_URL,
	templateEngine: 'swig',
	showStackError: true,
    imagesize: 20971520, // 20MB
    anidb: {
        client: 'nzedb',
        clientVersion: 2
    },
    thetvdb: {
        key: '9DAF49C96CBF8DAC'
    },
    ssl: {
        key: 'certs/127.0.0.1.key',
        cert: 'certs/127.0.0.1.cert'
    },

    imageCollections: {
    	fanart: 'anime.fanart',
    	poster: 'anime.poster',
    	episodeImage: 'episode.image'
    },

    // Duration the a token should be active in milliseconds
    tokenDurationInMS: 60 * 60 * 1000,
    // The secret should be set to a non-guessable string that
    // is used to generate the token hash
    tokenSecret: 'test',
    tokenPath: 'decodedToken',
    passwordRounds: 10
};
