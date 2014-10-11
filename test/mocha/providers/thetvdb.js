'use strict';

/**
 * Module dependencies.
 */
var TheTVDBProvider = require('../../../server/providers/thetvdbProvider'),
	mongoose = require('mongoose'),
	Anime = mongoose.model('Anime'),
	should = require('should');

/**
 * Test data
 */
var fakeAnime, fakeResponse;

/**
 * Tests
 */

describe('Provider TheTvDb:', function() {
	
	beforeEach(function(){
		fakeAnime = new Anime({
			episodes: [
				{
					description: 'Episode 1 description',
					number: 1,
					special: false,
					aired: new Date('01.01.1970'),
					runtime: 1,
					titles: [
						{title: 'Episode something else'},
						{title: 'Episode 1.5', lang: 'en'}
					],
					connections: [
						{
							siteId: 999,
							site: 'anidb',
						}
					]
				}
			],
			connections: [
				{
					siteId: 264663,
					mapping: 'season',
					season: 2,
					site: 'thetvdb',
					comment: 'Dum dum dum'
				},
				{
					siteId: 12,
					site: 'anidb',
					comment: 'This should be removed'
				},
				{
					siteId:13,
					site: 'anidb',
					comment: 'This should be removed'
				}
			]
		});

		fakeResponse = { 
			tvShow: { 
				id: '264663',
    			genre: '|Animation|',
    			language: 'en',
    			name: 'Date a Live',
    			firstAired: '2013-04-06T00:00:00.000Z',
    			imdbId: 'tt2575684',
    			banner: 'graphical/264663-g.jpg',
    			overview: 'Thirty years ago a strange phenomenon with him and kiss her.' 
    		},
    		episodes: [
    			{
    				id:'4788062',
    				name:'Nothing here',
    				number:'1',
    				language: 'en',
    				season:'1',
    				seasonId:'575556',
    				tvShowId:'264663',
    				lastUpdated:'1402246862',
    				firstAired:'2014-04-12T00:00:00.000Z',
    				overview:'Something.',
    				rating:'10.0',
    				ratingCount:'1'
    			},
    			{
    				id:'4788063',
    				name:'Daily Life',
    				number:'1',
    				language: 'en',
    				season:'2',
    				seasonId:'575557',
    				tvShowId:'264663',
    				lastUpdated:'1402246862',
    				firstAired:'2014-04-12T00:00:00.000Z',
    				overview:'Shido wakes up.',
    				rating:'10.0',
    				ratingCount:'1'
    			}
    		]
		};
	});

	it('Should fail when providing insufficient arguments', function(done){
		/*jshint immed: false */
		(function() { new TheTVDBProvider(); }).should.throw();
		/*jshint immed: true */
		done();
	});

	it('Should create it\'s own client if one is not given', function(done){
		var fakeAnime = {};

		var provider = new TheTVDBProvider(fakeAnime);
		should.exist(provider._client);
		done();
	});

	it('GetConnections should return the connections associated with the provider', function(done){

		var connections = new TheTVDBProvider(fakeAnime)._getConnections();
		should.exist(connections);
		connections.should.be.instanceof(Array).and.have.lengthOf(1);
		done();
	});

	it('updateEpisodes should update the episodes on the given anime', function(done){

		var fakeClient = {};
		fakeClient.getInfo = function(id, cb){
			cb(null, fakeResponse);
		};

		var provider = new TheTVDBProvider(fakeAnime, fakeClient);

		provider
		.refreshRemote()
		.updateEpisodes()
		.returnAnime(function(err, anime){
			if(err) {
				return done(err);
			}
			anime.episodes.should.be.instanceof(Array).and.have.lengthOf(1);
			anime.episodes[0].titles.should.be.instanceof(Array).and.have.lengthOf(3);
			done();
		});

	});

});
