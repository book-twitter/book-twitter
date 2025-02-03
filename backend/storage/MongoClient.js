const mongoose = require('mongoose');
const {logger} = require('../services/LoggerService');
const env = require('dotenv').config().parsed;

//Connect to MongoDB
try {
    mongoose.connect(env.MONGO_URI);
    logger.info('MongoDB client connected');
} catch (error) {
    logger.error('Failed to connect to MongoDB');
    process.exit(1);
}