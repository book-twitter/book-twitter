const Joi = require('joi');

const registerValidation = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required().min(8),
    confirmPassword: Joi.string().required().min(8)
});

const loginValidation = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const changeNameValidation = Joi.object({
    newName: Joi.string()
        .min(3)
        .max(30)
        .required()
});

const forgotPasswordValidation = Joi.object({
    email: Joi.string()
        .required()
        .email()
});

const resetPasswordValidation = Joi.object({
    password: Joi.string()
        .min(8)
        .required(),
    confirmPassword: Joi.string()
        .min(8)
        .required()
});

module.exports = {
    registerValidation,
    loginValidation,
    changeNameValidation,
    forgotPasswordValidation,
    resetPasswordValidation
}