const { check, validationResult } = require('express-validator');
const xss = require('xss');

const sanitizeInput = (input) => {
    return xss(input);
};

const validateRegistration = [
    check('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Invalid email address'),
    check('password')
        .trim()
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
    check('name')
        .trim()
        .notEmpty()
        .escape()
        .withMessage('Name is required'),
    (req, res, next) => {
        // Sanitize inputs
        req.body.email = sanitizeInput(req.body.email);
        req.body.name = sanitizeInput(req.body.name);
        if (req.body.shopName) {
            req.body.shopName = sanitizeInput(req.body.shopName);
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateLogin = [
    check('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Invalid email address'),
    check('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required'),
    (req, res, next) => {
        req.body.email = sanitizeInput(req.body.email);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateRegistration,
    validateLogin,
    sanitizeInput
};