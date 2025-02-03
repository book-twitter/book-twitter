//Special thanks to https://mirzaleka.medium.com/automated-logging-in-express-js-a1f85ca6c5cd

const winston = require('winston');
const CustomConsoleTransport = require('./transports/CustomConsoleTransport');
const fs = require('fs');
const { randomBytes } = require('crypto');
const path = require('path');
const { combine, timestamp, json, printf} = winston.format;
const filename = path.join(__dirname, '..', 'book-twitter-backend.log') 

try { 
  fs.unlinkSync(filename); 
} catch (ex) { 
}

const appVersion = process.env.npm_package_version;
const generateLogId = () => randomBytes(16).toString('hex');

//Logger configuration
const logger = winston.createLogger({
    level: 'silly',
    format: combine(
      timestamp({ format: 'MMM-DD-YYYY HH:mm:ssss' }),
      json(),
      printf(({ timestamp, level, message, data}) => {
        const response = {
          level,
          logId: generateLogId(),
          timestamp,
          appInfo: {
            appVersion,
            environment: process.env.NODE_ENV,
          },
          message,
          data: data || {},
        };

        return JSON.stringify(response, null, 2);
      })
    ),
    transports: [
      new winston.transports.File({filename}),
      new CustomConsoleTransport({
        name: 'customConsoleTransport',
        level: 'debug', // Minimum level for this transport
      })
    ],
});

module.exports = {
  logger
};