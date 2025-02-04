const bcrypt = require('bcrypt');
const zxcvbn = require('zxcvbn'); // For password strength checking

const SALT_ROUNDS = 12; // Increased from 10 to 12 for better security

const passwordSecurity = {
    // Hash password with salt
    hashPassword: async (password) => {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        return bcrypt.hash(password, salt);
    },

    // Validate password strength
    validatePassword: (password) => {
        const result = zxcvbn(password);
        const minimumScore = 3; // Requires strong password (0-4 scale)

        return {
            isStrong: result.score >= minimumScore,
            feedback: result.feedback.suggestions,
            score: result.score,
            requirements: {
                length: password.length >= 8,
                uppercase: /[A-Z]/.test(password),
                lowercase: /[a-z]/.test(password),
                number: /[0-9]/.test(password),
                special: /[^A-Za-z0-9]/.test(password)
            }
        };
    },

    // Compare password with hash
    comparePassword: async (password, hash) => {
        return bcrypt.compare(password, hash);
    }
};

module.exports = passwordSecurity; 