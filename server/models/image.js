'use strict';
//
// var mongoose = require('mongoose'),
//     Schema = mongoose.Schema,
//     Anime = mongoose.model('Anime'),
//     bluebird = require('bluebird'),
//     _ = require('lodash'),
//     config = require('../config/config');
//
// var ImageSchema = new Schema();
//
// /**
//  * Define the schemaes for the real imagecollections
//  */
//
// Object.keys(config.imageCollections).forEach(function(key){
//
//     var schema = new Schema({},{
//         collection: config.imageCollections[key] + '.files'
//     });
//
//     mongoose.model(key, schema);
// });
//
// /**
//  * Statics methods
//  */
//
// ImageSchema.statics.imagesInUse = function() {
//     var defer = bluebird.pending(),
//         fanarts = Anime.distinct('fanarts').exec(),
//         posters = Anime.distinct('posters').exec(),
//         episodeImages = Anime.distinct('episodes.images').exec();
//
//     bluebird.all([
//         fanarts,
//         posters,
//         episodeImages
//         ]).then(function(imagesInUse){
//             defer.resolve(_.flatten(imagesInUse));
//         }).error(defer.reject);
//
//     return defer.promise;
// };
//
// ImageSchema.statics.allImages = function(gfs){
//     var defers = [];
//
//      Object.keys(config.imageCollections).forEach(function(key){
//         var defer = bluebird.pending();
//         gfs.collection(config.imageCollections[key]).find({}).toArray(function(err, images){
//             if(err) return defer.reject(err);
//             defer.resolve(_.pluck(images, '_id'));
//         });
//         defers.push(defer.promise);
//     });
//
//     return bluebird.all(defers);
// };
//
// /**
//  * Returns all the images not currently associated
//  * to a model.
//  */
// ImageSchema.statics.imagesNotInUse = function(gfs) {
//     var defer = bluebird.pending(),
//     allImagesQuery = ImageSchema.statics.allImages(gfs),
//     imagesInUseQuery = ImageSchema.statics.imagesInUse(gfs);
//
//     bluebird.all([allImagesQuery, imagesInUseQuery]).spread(function(allImages, imagesInUse){
//         var toString = function(obj){ return obj.toString();};
//
//         // We need to toString the result to compare them, since lodash uses ===.
//         imagesInUse = imagesInUse.map(toString);
//         allImages = _.flatten(allImages).map(toString);
//
//         defer.resolve(_.difference(allImages, imagesInUse));
//
//     }).error(defer.reject);
//
//     return defer.promise;
// };
//
// ImageSchema.statics.deleteImages = function(gfs, imagesToDelete) {
//     var defers = [],
//         toObjectId = function (obj){ return new mongoose.Types.ObjectId(obj);};
//
//     Object.keys(config.imageCollections).map(function(key){
//         imagesToDelete.forEach(function(imageToDelete){
//             var defer = bluebird.pending();
//             gfs.collection(config.imageCollections[key]).remove({_id: toObjectId(imageToDelete)}, function(err){
//                 if(err) return defer.reject(err);
//                 defer.resolve();
//             });
//             defers.push(defer.promise);
//         });
//     });
//
//     return bluebird.all(defers);
//
// };
//
// mongoose.model('Image', ImageSchema);

exports.Schema = {};
