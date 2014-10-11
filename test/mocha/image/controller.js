'use strict';

/**
 * Module dependencies.
 */
var controller 	= require('../../../server/controllers/images'),
	mongoose 	= require('mongoose'),
	config		= require('../../../server/config/config'),
	stream 		= require('stream'),
	fs 			= require('fs'),
    should      = require('should');

//The tests
describe('Controller images:', function() {
	describe('Read methods', function(){
		var testid = 0, collection = config.imageCollections.fanart;

		before(function(done) {
			var writeStream = mongoose.gfs.createWriteStream({ filename: 'test.jpg', root: collection });
			testid = writeStream.id;
			fs.createReadStream('./test/mocha/data/image.jpg').pipe(writeStream);
			writeStream.on('close', function () {
				done();
			});
    	});

		it('should be able to read a file ', function(done) {
            var dummystream = stream.PassThrough();
            controller.downloadImage(testid, dummystream, collection);
            dummystream.on('data', function(){
                done();
            });
        });

    	after(function(done){
			mongoose.gfs.collection(collection).remove({_id: testid}, done);
    	});
	});
    describe('Write methods', function() {
        it('should be able to upload an image from a given url', function(done) {
            var collection = config.imageCollections.poster,
                url = 'http://urani.me/attachments/photos/orginal/51570d3d-1cbc-42d1-83de-7c29b8adc2dc.jpg',
                id;

            controller.uploadImageFromUrl(url, collection).then(function(file){
                should.exist(file);
                file.should.be.instanceof(Array).and.have.lengthOf(1);
                should.exist(file[0]._id);
                id = file._id;
                done();
            });
        });
    });
});
