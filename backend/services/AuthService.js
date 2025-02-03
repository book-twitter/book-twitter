const ResetToken = require('../models/ResetToken');
const jwt = require('jsonwebtoken');
const redisClient = require('../storage/RedisClient.js');
const env = require('dotenv').config().parsed;

/**
 * 
 * @param {String} token resetToken passed in the url
 * @returns {Object} Reset token or null
 */
async function resetTokenExists(token) {
    const resetToken = await ResetToken.findOne({ token: token }).lean();
    
    return resetToken;
}

/**
 * 
 * @param {Object} user Mongoose User object
 * @param {String} token Old JWT Token to invalidate
 */
async function expireJwtToken(user, token) {
    const expireIn = jwt.decode(token).exp;
    const currentTime = Math.floor(Date.now() / 1000);
    const ttl = expireIn - currentTime;
    
    if(ttl > 0) {
        await redisClient.set(`bv-revoked:${token}`, 'true', 'EX', ttl);
        user.activeToken = null;
        await user.save();
    } else {
        throw new Error('Token has already expired');
    }
}

/**
 * 
 * @param {String} token token to check if it is revoked
 * @returns true if token is revoked, false otherwise
 */
async function isTokenRevoked(token){
    const result = await redisClient.get(`bv-revoked:${token}`);
    return result !== null;
}

module.exports = {
    resetTokenExists,
    expireJwtToken,
    isTokenRevoked
}
