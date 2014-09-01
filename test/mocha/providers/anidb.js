'use strict';

/**
 * Module dependencies.
 */
var anidbProvider = require('../../../server/providers/anidbProvider'),
	should = require('should'),
	anidb = require('anidb');


/**
 * Test data
 */

/**
 * The tests
 */
describe('<Unit Test>', function() {
	describe('Provider AniDb:', function() {
		
		it('Should fail when providing insufficient arguments', function(done){
			(function() { new anidbProvider() }).should.throw();
			done();
		});

		it('Should use the given anidb-client if given one as second argument', function(done){
			var fakeAnime  =  {};
			var fakeClient =  {identificator: 'HellsBells'};

			var provider = new anidbProvider(fakeAnime, fakeClient);
			provider._client.should.have.property('identificator', fakeClient.identificator);
			done();
		});

		it('Should create it\'s own client if one is not given', function(done){
			var fakeAnime = {};

			var provider = new anidbProvider(fakeAnime);
			should.exist(provider._client);
			done();
		});

		it('GetConnections should return the connections assoicatied with the provider', function(done){
			var fakeAnime = {
				connections: [
					{
						site_id: 12,
						site: 'anidb',
						comment: 'Dum dum dum'
					},
					{
						site_id:13,
						site: 'anidb',
						comment: 'Da-di-dum'
					},
					{
						site_id:2000,
						site:'thetvdb',
						comment: 'This should be removed'
					}
				]
			};

			var connections = new anidbProvider(fakeAnime)._getConnections();
			should.exist(connections);
			connections.should.be.instanceof(Array).and.have.lengthOf(2);
			done();
		});

		it('updateEpisodes should update the episodes on the given anime', function(done){
			var fakeAnime = {
				episodes: [
					{
						name: 'Episode 1',
						description: 'Episode 1 description',
						number: 1,
						special: false,
						aired: new Date('01.01.1970'),
						runtime: 1,
						connections: [
							{
								site_id: 1000,
								site: 'anidb'
							}
						]
					}
				],
				connections: [
					{
						site_id: 12,
						site: 'anidb',
						comment: 'Dum dum dum'
					}
				]
			};

			var fakeResponse = {
				episodes: [
					{
						id: 1000,
				        epno: 1,
				        type: 1,
				        length: 25,
				        airdate: new Date('02.01.1970'),
				        titles: [
				        { title: 'Episode 1.5'},
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
				        { title: 'Dafuq is this?'}]
					}
				]
			};

			var fakeClient = new anidb();
			fakeClient.getAnime = function(id, cb){
				cb(null, fakeResponse);
			};

			
			new anidbProvider(fakeAnime, fakeClient)
				.updateEpisodes()
				.then(function(anime){
					anime.episodes.should.be.instanceof(Array).and.have.lengthOf(2);
					anime.episodes[0].should.have.property('name','Episode 1.5');
					done();
				});

		});

	});
});