const jwt = require('jsonwebtoken');

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ 
                message: 'Access denied. No token provided.' 
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            req.user = decoded;

            // Check if user's role is allowed
            if (!allowedRoles.includes(decoded.role)) {
                return res.status(403).json({ 
                    message: 'Access denied. Insufficient privileges.' 
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({ 
                message: 'Invalid token' 
            });
        }
    };
};

module.exports = authorize;