const jwt = require('jsonwebtoken');
const Admin = require('../models/adminSchema');
const Seller = require('../models/sellerSchema');
const Customer = require('../models/customerSchema');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization token not found' });
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // Find user and their role
        const admin = await Admin.findById(decoded.userId);
        const seller = await Seller.findById(decoded.userId);
        const customer = await Customer.findById(decoded.userId);

        const user = admin || seller || customer;

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = {
            userId: decoded.userId,
            role: user.role
        };
        
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;