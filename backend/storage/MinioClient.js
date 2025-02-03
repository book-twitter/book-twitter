const Minio = require('minio');
const env = require('dotenv').config().parsed;

const minioClient = new Minio.Client({
    endPoint: 's3.phantominv.studio',
    port: 443,
    useSSL: true,
    accessKey: env.MINIO_ACCESS_KEY,
    secretKey: env.MINIO_SECRET_KEY
});

module.exports = minioClient;