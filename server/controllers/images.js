'use strict';
var multiparty  = require('multiparty'),
	bluebird	= require('bluebird'),
	gm  = require('gm');


/**
 * Here we check only the byteCount field on the stream.
 * Reading the entire stream just to check the length would be
 * too expensive. 
 */
var streamIsAllowedFileSize = function(stream){
	var resolver = bluebird.pending(),
		limit = 1024 * 1024 * 1, // 20MB
		byteCount = stream.byteCount || parseInt(stream.byteCount, 10); 

	if(byteCount > limit || byteCount === 0){
		resolver.reject('Too big file');
	}
	else{
		resolver.resolve(stream);
	}
	return resolver.promise;
};

/**
 * 
 */
var streamIsAllowedFileType = function(stream){
	var resolver = bluebird.pending(),
		allowedFileTypes = ['png','jpeg','jpg'],
		error = 'Unknown filetype';

	gm(stream)
	.format({bufferStream: true}, function(err, format){
		if(err) return resolver.reject(err);

		if(typeof format === 'undefined' || allowedFileTypes.indexOf(format.toLowerCase()) < 0){
			resolver.reject(error);
		}
	})
	.stream(function (err, stdout, stderr) {
		if(err) return resolver.reject(err);
		resolver.resolve(stdout);
	});

	return resolver.promise;

};

var uploadImage = function(req, res, imageType){
	var form = new multiparty.Form(),
		gfs = req.gfs, 
		promises = [];

	form.on('error', function(err){
		if(err)
			res.send(500, err);
		else
			res.send(500, 'An error occurred parsing the uploaded files');
	});

	form.on('part', function(part) {
		var resolver = bluebird.pending();

		if (part.filename === null) {
			part.resume();
		}

		if (part.filename !== null) {
			promises.push(resolver.promise);

			// Validate the uploaded file.
			streamIsAllowedFileSize(part)
			.then(streamIsAllowedFileType)
			.then(function(stream){

				var writestream = gfs.createWriteStream({
			    	filename: part.filename,
			    	root: imageType
				});

				stream.pipe(writestream);

				writestream.on('close', function(file){
					resolver.resolve(file);
				});

				writestream.on('error', function(err){
					form.emit('error');
				});

			}).catch(function(err){
				console.log('test', err);
				form.emit('error', 'An error occurred parsing the uploaded files. Check the filetype and size');
			});

		}
	});

	form.on('close', function(){
		bluebird.all(promises).then(function(files){
			res.send(files);
		});
	});

	form.parse(req);
};

var downloadImage = function(req, res, imageType){
	var id = req.params.id,
		gfs = req.gfs;

	var readstream = gfs.createReadStream({
		_id: id,
		root: imageType
	});
	readstream.pipe(res);
};

exports.uploadFanart = function(req, res){
	uploadImage(req, res, 'anime.fanart');
};

exports.uploadPoster = function(req, res){
	uploadImage(req, res, 'anime.poster');
};

exports.uploadEpisodeImage = function(req, res){
	uploadImage(req, res, 'episode.image');
};

exports.downloadFanart = function(req, res){
	downloadImage(req, res, 'anime.fanart');
};

exports.downloadPoster = function(req, res){
	downloadImage(req, res, 'anime.poster');
};

exports.downloadEpisodeImage = function(req, res){
	downloadImage(req, res, 'episode.image');
};