'use strict';
var multiparty  = require('multiparty'),
    bluebird    = require('bluebird'),
    config      = require('../config/config'),
    winston     = require('winston'),
    mongoose    = require('mongoose'),
    imageType   = require('image-type'),
    http        = require('http');


/**
 * Here we check only the byteCount field on the stream.
 * Reading the entire stream just to check the length would be
 * too expensive. 
 */
var streamIsAllowedFileSize = function(stream){
    var resolver = bluebird.pending(),
        limit = config.imagesize,
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
        allowedFileTypes = ['png','jpg'],
        error = 'Unknown filetype';

    stream.once('data', function(data){
        var type = imageType(data);
        stream.position = 0;
        if(!type || allowedFileTypes.indexOf(type.toLowerCase()) < 0){
            resolver.reject(error);
            return;
        }
        resolver.resolve(stream);
    });

    return resolver.promise;
};

var uploadImageFromUrl = function(url, collection){
    var defer = bluebird.pending();

    http.get(url, function (res) {
        // Validate the uploaded file.
        streamIsAllowedFileSize(res)
        .then(streamIsAllowedFileType)
        .then(function(stream){

            var writestream = mongoose.gfs.createWriteStream({
                filename: res.path,
                root: collection
            });

            stream.pipe(writestream);

            writestream.on('close', function(file){
                defer.resolve([file]);
            });

            writestream.on('error', function(err){
                defer.reject(err);
            });

        }).catch(function(err){
            defer.reject(err);
        });
    });

    return defer.promise;
};

/**
 * Uploads an image to the specified grid-store and returns the information.
 * @param  {object} req express request object
 * @param  {object} res express response object
 * @param  {string} collection the collection to save the file. eg. poster, fanart etc.
 * @return {promise}
 */
var uploadImageFromForm = function(req, res, collection){
    var form = new multiparty.Form(),
        gfs = mongoose.gfs, 
        promises = [],
        promise = bluebird.pending();
        
    form.on('error', function(err){
        promise.reject(err || 'An error occurred parsing the uploaded files');
    });

    form.on('part', function(part) {
        var resolver = bluebird.pending();

        if (part.filename === null)
            return part.resume();

        promises.push(resolver.promise);
        
        // Validate the uploaded file.
        streamIsAllowedFileSize(part)
        .then(streamIsAllowedFileType)
        .then(function(stream){

            var writestream = gfs.createWriteStream({
                filename: part.filename,
                root: collection
            });

            stream.pipe(writestream);

            writestream.on('close', function(file){
                resolver.resolve(file);
            });

            writestream.on('error', function(err){
                form.emit('error', err);
            });

        }).catch(function(err){
            form.emit('error', 'An error occurred parsing the uploaded files. Check the filetype and size');
        });
    });

    form.on('close', function(){
        bluebird.all(promises).then(function(files){
            promise.resolve(files);
        });
    });

    form.parse(req);
    return promise.promise;
};

var downloadImage = function(id, outStream, imageType){
    var gfs = mongoose.gfs;

    var readstream = gfs.createReadStream({
        _id: id,
        root: imageType
    });

    readstream.pipe(outStream);
};

var loggCallback = function(err){
    winston.error('An error occurred during file-upload', err);
};

exports.uploadFanart = function(req, res){
    var url = req.param('url'),
        action = typeof url !== 'undefined' ? 
                uploadImageFromUrl(url, config.imageCollections.fanart) : 
                uploadImageFromForm(req, res, config.imageCollections.fanart);
    
    action.then(function(files){
        if(res) res.send(files);
    },function(err){
        if(res) res.send(500, err);
    }).then(null, loggCallback);
};

exports.uploadPoster = function(req, res){
    uploadImageFromForm(req, res, config.imageCollections.poster).then(function(files){
        res.send(files);
    },function(err){
        res.send(500, err);
    });
};

exports.uploadEpisodeImage = function(req, res){
    uploadImageFromForm(req, res, config.imageCollections.episodeImage).then(function(files){
        res.send(files);
    },function(err){
        res.send(500, err);
    });
};

exports.downloadFanart = function(req, res){
    downloadImage(req.params.id, res, config.imageCollections.fanart);
};

exports.downloadPoster = function(req, res){
    downloadImage(req.params.id, res, config.imageCollections.poster);
};

exports.downloadEpisodeImage = function(req, res){
    downloadImage(req.params.id, res, config.imageCollections.episodeImage);
};

exports.downloadImage = downloadImage; 
exports.uploadImageFromUrl = uploadImageFromUrl;