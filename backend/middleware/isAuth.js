const jwt = require('jsonwebtoken');
const {isTokenRevoked} = require('../services/AuthService');
const env = require('dotenv').config().parsed;

/**
 * Authentication middleware
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @returns {Response}
 * 
 * @description Middleware to check if the request is authenticated
 * 
 * @throws {Error} If the token is invalid or revoked
 * 
 */
async function isAuth(req, res, next) {
  try {
    const token = req.header('auth-token');
    if(!token) return res.status(401).send('Access denied');
    const verified = jwt.verify(token, env.JWT_SECRET, async (err, decoded) => {
  
      if (err) return res.status(401).send('Invalid token');
      try {
        const revoked = await isTokenRevoked(token);
  
        if(revoked) return res.status(401).send('Token revoked');
        req.user = decoded;
        next();
      } catch (err) {
        return res.status(500).send('Internal server error occurred while authenticating the request');
      }
    });
    
  } catch (err) {
    return res.status(500).send('Internal server error occurred while authenticating the request');
  }
}

module.exports = isAuth;
