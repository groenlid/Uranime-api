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
    var testImagePath = './test/mocha/data/image.jpg',
        fileContent = fs.readFileSync(testImagePath);

	describe('Read methods', function(){
		var testid = 0, collection = config.imageCollections.fanart;

		before(function(done) {
			var writeStream = mongoose.gfs.createWriteStream({ filename: 'test.jpg', root: collection });
			testid = writeStream.id;
			fs.createReadStream(testImagePath).pipe(writeStream);
			writeStream.on('close', function () {
				done();
			});
    	});

        after(function(done){
            mongoose.gfs.collection(collection).remove({_id: testid}, done);
        });

		it('should be able to read a file ', function(done) {
            var readable = stream.PassThrough(),
                streamLength = 0;
            controller.downloadImage(testid, readable, collection);
            readable.on('data', function(chunk) {
                streamLength += chunk.length;
            });
            readable.resume(); // Set the stream to flowing mode
            readable.on('end', function(){
                streamLength.should.equal(fileContent.length);
                done();
            });
        });
    	
	});

    describe('Write methods', function() {
        var tmpFunction;
        before(function() {
            tmpFunction = controller.getFromUrl;
            controller.getFromUrl = function(url, callback){
                callback(fs.createReadStream(testImagePath));
            };
        });

        after(function(){
            controller.getFromUrl = tmpFunction;
        });

        it('should be able to upload an image from a given url', function(done) {
            var collection = config.imageCollections.poster,
                url = 'http://test.com',
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
