const express = require('express');
const cors = require('cors');
const compression = require('compression');
const {logger} = require('./services/LoggerService');
const env = require('dotenv').config().parsed;

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1)

//Connect to MongoDB
require('./storage/MongoClient');

//Connect to redis 
const redisClient = require('./storage/RedisClient');

//Setup JsonParser
app.use(express.json());

//Enable gzip compression
app.use(compression())

//Enable CORS
app.use(cors());

//Setup routing
const authRoute = require('./routes/AuthRoute');

app.use("/auth/", authRoute);

app.listen(env.PORT, () => logger.info('Backend is up and running on port ' + env.PORT));