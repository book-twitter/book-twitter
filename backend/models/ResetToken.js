const mongoose = require('mongoose');

const RevokedTokenSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    }, expireAt: {
        type: Date,
        required: true,
        default: Date.now,
    }
}, {versionKey: false});

module.exports = new mongoose.model('resettoken', RevokedTokenSchema);