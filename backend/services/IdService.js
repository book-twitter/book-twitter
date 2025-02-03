const crypto = require('crypto');

/**
 * 
 * @returns {string} A randomly generated reset token
 * @description Generates a random reset token for password reset
 */
async function generateResetToken() {
    const secureToken = crypto.randomBytes(32).toString('hex');
    return `RT-${secureToken}`;
}



module.exports.generateResetToken = generateResetToken;
