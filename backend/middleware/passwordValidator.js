const passwordStrengthValidator = (password) => {
    const minLength = 8;
    const maxLength = 32;
    
    const validationResult = {
        isValid: false,
        errors: [],
        strength: 0
    };

    // Length check
    if (password.length < minLength || password.length > maxLength) {
        validationResult.errors.push(`Password must be between ${minLength} and ${maxLength} characters`);
    }

    // Complexity checks
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase) validationResult.errors.push('Must contain at least one uppercase letter');
    if (!hasLowerCase) validationResult.errors.push('Must contain at least one lowercase letter');
    if (!hasNumbers) validationResult.errors.push('Must contain at least one number');
    if (!hasSpecialChars) validationResult.errors.push('Must contain at least one special character');

    // Calculate strength
    validationResult.strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars]
        .filter(Boolean).length * 25;

    validationResult.isValid = validationResult.errors.length === 0;

    return validationResult;
};

module.exports = passwordStrengthValidator;