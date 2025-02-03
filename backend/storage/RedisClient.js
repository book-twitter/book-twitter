const Redis = require("ioredis");
const {logger} = require('../services/LoggerService');
const env = require('dotenv').config().parsed;

//Connect redis
const redisClient = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    username: env.REDIS_USERNAME,
    password: env.REDIS_PASSWORD,
    db: 0
});

logger.info('Redis client connected');
module.exports = redisClient;