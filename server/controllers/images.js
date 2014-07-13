'use strict';
var multiparty = require('multiparty'),
	bluebird	= require('bluebird');

var uploadImage = function(req, res, imageType){
	var form = new multiparty.Form(),
		gfs = req.gfs, 
		promises = [];

	form.on('error', function(err){
		res.send(500, 'An error occurred parsing the uploaded files');
	});

	form.on('part', function(part) {
		var resolver = bluebird.pending();

		if (part.filename === null) {
			part.resume();
		}

		if (part.filename !== null) {
			promises.push(resolver.promise);
			var writestream = gfs.createWriteStream({
			    filename: part.filename,
			    root: imageType
			});

			part.pipe(writestream);

			writestream.on('close', function(file){
				resolver.resolve(file);
			});

			writestream.on('error', function(err){
				part.emit('error');
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