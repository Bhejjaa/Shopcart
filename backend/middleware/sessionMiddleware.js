const validateSession = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: 'Session expired. Please login again.' });
    }
    next();
};

module.exports = validateSession;