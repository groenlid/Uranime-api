'use strict';

/**
 * Module dependencies.
 */
var should      = require('should'),
    mongoose    = require('mongoose'),
    Anime       = mongoose.model('Anime'),
    Genre         = mongoose.model('Genre');

//Globals
var basicAnime;
var basicGenre;

//The tests
describe('<Unit Test>', function() {
    describe('Model Anime:', function() {
        beforeEach(function(done) {
            basicGenre = new Genre({
                _id: 'Sample Genre',
                description: 'Sample description'
            });
            basicGenre.save(function(err, basicGenre){
                basicAnime = new Anime({
                    title: 'Test Anime',
                    description: 'Sample description',
                });
                basicAnime.save(function(){
                    done();
                });
            });
            
        });

        describe('Method Save', function() {
            it('should be able to save without problems', function(done) {
                return basicAnime.save(function(err) {
                    should.not.exist(err);
                    done();
                });
            });

            it('should be able to show an error when try to save without title', function(done) {
                basicAnime.title = '';

                return basicAnime.save(function(err) {
                    should.exist(err);
                    done();
                });
            });
        });

        describe('Method Relations', function(){
            it('added genres should be saved with the anime', function(done){
                basicAnime.genres.push(basicGenre);
                basicAnime.save(function(err){
                    if (err) return done(err);
                    Anime.findOne({_id: basicAnime._id}, function(err, animeInDatabase){
                        animeInDatabase.genres.should.have.length(1);
                        done();
                    });
                });
            });

            it('should be able to add an episode to existing anime', function(done){
                basicAnime.episodes.push({
                    name: 'Episode title',
                    description: 'Episode description',
                    special: true,
                    aired: new Date()
                });
                basicAnime.save(function(err, animeInDatabase){
                    if(err) return done(err);
                    
                    animeInDatabase.episodes.should.have.length(1);
                    done();
                });
            });
        });

        afterEach(function(done) {
            basicAnime.remove();
            basicGenre.remove();
            done();
        });
    });
});