const mongoose = require("mongoose");
const { randomUUID } = require('crypto');
const env = require('dotenv').config().parsed;

const userSchema = new mongoose.Schema({
    uuid: {
        type: String,
        default: () => randomUUID().toString()
    },
    provider: {
        type: String,
        required: false,
        default: 'local'
    },
    providerId: {
        type: String,
        required: false,
        default: null
    },
    name: {
        type: String,
        required: true,
        min: 3,
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String
    },
    activeToken: {
        type: String,
        required: false,
        default: null
    },
    profileIcon: {
        type: String,
        default: env.DEFAULT_USER_ICON
    },
    registeredAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('users', userSchema);