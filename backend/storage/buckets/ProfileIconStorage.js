const minioClient = require('../MinioClient');
const path = require('path');
const env = require('dotenv').config().parsed;

const bucketName = 'book-verse-profile-icons';

const minioStorage = {
    _handleFile: async function(req, file, cb) {
        const uuid = req.user.uuid;
        const extension = path.extname(file.originalname);
        const filename = uuid + extension;
        const fileStream = file.stream;

        await minioClient.putObject(bucketName, filename, fileStream, file.size, function(err, etag) {
            if (err) return cb(err);

            req.file = {
                filename: filename,
                etag: etag
            };
        });

        cb(null, req.file);
    },
    _removeFile: async function(req, file, cb) {
        const filename = file.filename;
        
        try {
            await minioClient.removeObject(bucketName, filename);
            cb(null);
        } catch (err) {
            cb(err);
        }
    }
};

module.exports = minioStorage;