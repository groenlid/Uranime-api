// 'use strict';
// var multiparty  = require('multiparty'),
//     bluebird    = require('bluebird'),
//     config      = require('../config/config'),
//     winston     = require('winston'),
//     mongoose    = require('mongoose'),
//     imageType   = require('image-type'),
//     http        = require('http'),
//     util        = require('util');
//
//
// /**
//  * Expose this method for easy mocking.
//  * @param  {string}   url      Url to get resource from
//  * @param  {Function} callback
//  */
// exports.getFromUrl = function(url, callback){
//     return http.get(url, callback);
// };
//
// /**
//  * Here we check only the byteCount field on the stream.
//  * Reading the entire stream just to check the length would be
//  * too expensive.
//  */
// var streamIsAllowedFileSize = function(stream){
//     var resolver = bluebird.pending(),
//         limit = config.imagesize,
//         byteCount = stream.byteCount || parseInt(stream.byteCount, 10);
//
//     if(byteCount > limit || byteCount === 0){
//         resolver.reject('The file is too big');
//     }
//     else{
//         resolver.resolve(stream);
//     }
//     return resolver.promise;
// };
//
// /**
//  *
//  */
// var streamIsAllowedFileType = function(inputStream){
//     var resolver = bluebird.pending(),
//         allowedFileTypes = ['png','jpg'],
//         error = 'Unknown filetype. Allowed filetypes are %s. Got filetype %s';
//
//     inputStream.on('readable', function() {
//         var data = inputStream.read(16);
//         var type = imageType(data);
//
//         if(!type || allowedFileTypes.indexOf(type.toLowerCase()) < 0){
//             resolver.reject(util.format(error, allowedFileTypes, type));
//             return;
//         }
//
//         inputStream.unshift(data);
//         resolver.resolve(inputStream);
//     });
//
//     return resolver.promise;
// };
//
//
//
// var uploadImageFromUrl = function(url, collection){
//     var defer = bluebird.pending();
//
//     exports.getFromUrl(url, function (res) {
//         res.pause();
//         res.on('error', function(err){
//             defer.reject(err);
//         });
//         // Validate the uploaded file.
//         streamIsAllowedFileSize(res)
//         .then(streamIsAllowedFileType)
//         .then(function(){
//             winston.log('writing to gridfs');
//             var writestream = mongoose.gfs.createWriteStream({
//                 filename: res.path,
//                 root: collection
//             });
//
//             res.pipe(writestream);
//             res.resume();
//             writestream.on('close', function(file){
//                 winston.log('finished writing to gridfs');
//
//                 defer.resolve([file]);
//             });
//
//             writestream.on('error', function(err){
//                 defer.reject(err);
//             });
//
//         }).catch(function(err){
//             defer.reject(err);
//         });
//     });
//
//     return defer.promise;
// };
//
// /**
//  * Uploads an image to the specified grid-store and returns the information.
//  * @param  {object} req express request object
//  * @param  {string} collection the collection to save the file. eg. poster, fanart etc.
//  * @return {promise}
//  */
// var uploadImageFromForm = function(req, collection){
//     var form = new multiparty.Form(),
//         gfs = mongoose.gfs,
//         promises = [],
//         promise = bluebird.pending();
//
//     form.on('error', function(err){
//         console.log(err, 'error');
//         promise.reject(err || 'An error occurred parsing the uploaded files');
//     });
//
//     form.on('part', function(part) {
//         var resolver = bluebird.pending();
//
//         if (part.filename === null)
//             return part.resume();
//
//         promises.push(resolver.promise);
//
//         // Validate the uploaded file.
//         streamIsAllowedFileSize(part)
//         .then(streamIsAllowedFileType)
//         .then(function(stream){
//             var writestream = gfs.createWriteStream({
//                 filename: part.filename,
//                 root: collection
//             });
//
//             stream.pipe(writestream);
//
//             writestream.on('close', function(file){
//                 resolver.resolve(file);
//             });
//
//             writestream.on('error', function(err){
//                 form.emit('error', err);
//             });
//
//         }).catch(function(err){
//             form.emit('error', 'An error occurred parsing the uploaded files. Check the filetype and size');
//         });
//     });
//
//     form.on('close', function(){
//         bluebird.all(promises).then(function(files){
//             promise.resolve(files);
//         });
//     });
//
//     form.parse(req);
//     return promise.promise;
// };
//
// var downloadImage = function(id, imageType){
//     return new bluebird(function(resolve, reject){
//         var gfs = mongoose.gfs,
//         options = {
//             _id: id,
//             root: imageType
//         };
//
//         gfs.exist(options, function (err, found) {
//             if(err){
//                 reject({code: 500, msg:'An error occurred during file-download'});
//                 return;
//             }
//             if(found){
//                 resolve(gfs.createReadStream(options));
//             }
//             else {
//                 reject({code: 404});
//             }
//         });
//     });
//
// };
//
// var loggCallback = function(err){
//     winston.error('An error occurred during file-upload', err);
// };
//
// var uploadImage = function(req, res, imageType){
//     var url = req.param('url'),
//         action = typeof url !== 'undefined' ?
//                 uploadImageFromUrl(url, imageType) :
//                 uploadImageFromForm(req, imageType);
//
//     action.then(function(files){
//         if(res) res.send(files);
//     },function(err){
//         if(res) res.send(500, err);
//     }).then(null, loggCallback);
// };
//
// exports.uploadFanart = function(req, res){
//     uploadImage(req, res, config.imageCollections.fanart);
// };
//
// exports.uploadPoster = function(req, res){
//     uploadImage(req, res, config.imageCollections.poster);
// };
//
// exports.uploadEpisodeImage = function(req, res){
//     uploadImage(req, res, config.imageCollections.episodeImage);
// };
//
// exports.downloadFanart = function(req, res){
//     downloadImage(req.params.id, config.imageCollections.fanart).then(function(stream){
//         stream.pipe(res);
//     }, function(codeAndMessage){
//         res.send(codeAndMessage.code, codeAndMessage.msg);
//     });
// };
//
// exports.downloadPoster = function(req, res){
//     downloadImage(req.params.id, config.imageCollections.poster).then(function(stream){
//         stream.pipe(res);
//     }, function(codeAndMessage){
//         res.send(codeAndMessage.code, codeAndMessage.msg);
//     });
// };
//
// exports.downloadEpisodeImage = function(req, res){
//     downloadImage(req.params.id, config.imageCollections.episodeImage).then(function(stream){
//         stream.pipe(res);
//     }, function(codeAndMessage){
//         res.send(codeAndMessage.code, codeAndMessage.msg);
//     });
// };
//
// exports.downloadImage = downloadImage;
// exports.uploadImageFromUrl = uploadImageFromUrl;
