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

/**
 * Tests
 */

describe('<Unit Test>', function() {
	describe('Provider TheTvDb:', function() {
		
		it('Should fail when providing insufficient arguments', function(done){
			/*jshint immed: false */
			(function() { new TheTVDBProvider(); }).should.throw();
			/*jshint immed: true */
			done();
		});

		it('Should always create it\'s own client', function(done){
			var fakeAnime = {};

			var provider = new TheTVDBProvider(fakeAnime);
			should.exist(provider._client);
			done();
		});

		it('GetConnections should return the connections associated with the provider', function(done){
			var fakeAnime = {
				connections: [
					{
						siteId: 12,
						site: 'anidb',
						comment: 'This should be removed'
					},
					{
						siteId:13,
						site: 'anidb',
						comment: 'This should be removed'
					},
					{
						siteId:2000,
						site:'thetvdb',
						comment: 'Da-di-dum'
					}
				]
			};

			var connections = new TheTVDBProvider(fakeAnime)._getConnections();
			should.exist(connections);
			connections.should.be.instanceof(Array).and.have.lengthOf(1);
			done();
		});

		it('updateEpisodes should update the episodes on the given anime', function(done){
			var fakeAnime = new Anime({
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
								siteId: 1000,
								site: 'thetvdb',
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
					}
				]
			});

			var fakeResponse = {
				episodes: [
					{
						id: 1000,
				        epno: 1,
				        type: 1,
				        length: 25,
				        airdate: new Date('02.01.1970'),
				        titles: [
				        { title: 'Episode 1', lang: 'en'},
				        { title: 'Episode something else'}]
					},
					{
						id: 1001,
				        epno: 2,
				        type: 1,
				        length: 20,
				        airdate: new Date('08.01.1970'),
				        titles: [
				        { title: 'There is something going on..'},
				        { title: 'Dafuq is this?', lang: 'en'}]
					}
				]
			};

			var fakeClient = {};
			fakeClient.getAnime = function(id, cb){
				cb(null, fakeResponse);
			};

			var provider = new TheTVDBProvider(fakeAnime);

			provider.refreshRemote()
			//.then(provider.updateEpisodes)
			//.then(provider.returnAnime)
			.then(function(anime){
				console.dir(JSON.stringify(provider._remoteAnime));
				done();
			});

		});

	});
});