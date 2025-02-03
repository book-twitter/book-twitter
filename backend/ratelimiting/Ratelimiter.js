const rateLimit = require('express-rate-limit').rateLimit;
const env = require('dotenv').config().parsed;
const allowList = ["127.0.0.1", "192.168.0.1"] // Whitelisted IPs

// Function to conditionally apply rate limiter
const applyRateLimiter = (limiter) => {
    return env.RATE_LIMIT_ENABLED ? limiter : (req, res, next) => next();
};

// Rate limiter for login requests
const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 3, // limit each IP to 3 requests per windowMs
    message: "Too many login attempts, please try again later",
    legacyHeaders: false,
    skip: (req, res) => allowList.includes(req.ip) // Skip rate limiting for whitelisted IPs
});

// Rate limiter for registration requests
const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // limit each IP to 2 requests per windowMs
    message: "Too many registration attempts, please try again later",
    legacyHeaders: false,
    skip: (req, res) => allowList.includes(req.ip) // Skip rate limiting for whitelisted IPs
});

// Rate limiter for forgot password requests
const forgotPasswordLimiter = rateLimit({
    windowMs: 20 * 60 * 1000, // 20 minutes
    max: 3, // limit each IP to 2 requests per windowMs
    message: "Too many forgot password attempts, please try again later",
    legacyHeaders: false,
    skip: (req, res) => allowList.includes(req.ip) // Skip rate limiting for whitelisted IPs
});

module.exports.loginLimiter = applyRateLimiter(loginLimiter);
module.exports.registerLimiter = applyRateLimiter(registerLimiter);
module.exports.forgotPasswordLimiter = applyRateLimiter(forgotPasswordLimiter);