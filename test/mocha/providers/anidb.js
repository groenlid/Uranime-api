'use strict';

/**
 * Module dependencies.
 */
var anidbProvider = require('../../../server/providers/anidbProvider'),
	should = require('should'),
	mongoose = require('mongoose'),
	Anime = mongoose.model('Anime'),
	anidb = require('anidb');

/**
 * The tests
 */
describe('Provider AniDb:', function() {
	
	it('Should fail when providing insufficient arguments', function(done){
		/*jshint immed: false */
		(function() { new anidbProvider(); }).should.throw();
		/*jshint immed: true */
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

	it('GetConnections should return the connections associated with the provider', function(done){
		var fakeAnime = {
			connections: [
				{
					siteId: 12,
					site: 'anidb',
					comment: 'Dum dum dum'
				},
				{
					siteId:13,
					site: 'anidb',
					comment: 'Da-di-dum'
				},
				{
					siteId:2000,
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
							site: 'anidb',
						}
					]
				}
			],
			connections: [
				{
					siteId: 12,
					site: 'anidb',
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

		var fakeClient = new anidb();
		fakeClient.getAnime = function(id, cb){
			cb(null, fakeResponse);
		};

		new anidbProvider(fakeAnime, fakeClient)
			.refreshRemote()
			.updateEpisodes()
			.returnAnime(function(err, anime){
				anime.episodes.should.be.instanceof(Array).and.have.lengthOf(2);
				anime.episodes[0].titles.should.be.instanceof(Array).and.have.lengthOf(3);
				anime.episodes[0].connections.should.be.instanceof(Array).and.have.lengthOf(1);
				anime.episodes[0].connections[0].should.have.property('siteId', '1000');
				anime.episodes[1].connections.should.be.instanceof(Array).and.have.lengthOf(1);
				anime.episodes[1].connections[0].should.have.property('siteId', '1001');
				done();
			});

	});

});
