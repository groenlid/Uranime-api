'use strict';

var mongoose = require('mongoose'),
    ImageModel = mongoose.model('Image');

module.exports = function(app, agenda, gfs) {

    var scheduledName = 'cleanup: images';

    agenda.define(scheduledName, {concurrency: 1} ,function(job, done) {

        ImageModel.imagesNotInUse(gfs).then(function(images){
            if(images.length === 0){
                console.log('No unused images. Scheduled job finished');
                done();
                return;
            }
            console.log('Deleting ' + images.length + ' unused images');
            ImageModel.deleteImages(gfs, images).then(done);
        });

    });

    //agenda.now(scheduledName);
    agenda.every('1 day', scheduledName);

};