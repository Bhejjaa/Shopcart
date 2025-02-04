const bcrypt = require('bcrypt');
const Admin = require('../models/adminSchema.js');
const { createNewToken } = require('../utils/token.js');
const { verifyMFAToken, generateMFASecret } = require('../utils/mfa.js');

const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

const adminLogin = async (req, res) => {
    try {
        const { email, password, mfaToken } = req.body;

        if (!email || !password || !mfaToken) {
            return res.status(400).send({ 
                message: "Email, password, and MFA token are required" 
            });
        }

        let admin = await Admin.findOne({ email });
        
        if (!admin) {
            return res.status(404).send({ message: "Admin not found" });
        }

        // Check if account is locked
        if (admin.accountLocked && admin.lockUntil > Date.now()) {
            return res.status(403).send({ 
                message: `Account is locked. Try again after ${new Date(admin.lockUntil).toLocaleString()}` 
            });
        }

        const validated = await bcrypt.compare(password, admin.password);
        
        if (!validated) {
            admin.failedLoginAttempts += 1;
            
            if (admin.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
                admin.accountLocked = true;
                admin.lockUntil = Date.now() + LOCK_TIME;
                await admin.save();
                return res.status(403).send({ 
                    message: "Account locked due to too many failed attempts." 
                });
            }
            
            await admin.save();
            return res.status(401).send({ 
                message: `Invalid password. ${MAX_LOGIN_ATTEMPTS - admin.failedLoginAttempts} attempts remaining` 
            });
        }

        // Verify MFA (required for admin)
        const validMFA = verifyMFAToken(admin.mfaSecret, mfaToken);
        if (!validMFA) {
            return res.status(401).send({ message: "Invalid MFA token" });
        }

        // Reset failed attempts on successful login
        admin.failedLoginAttempts = 0;
        await admin.save();

        // Create session token
        const token = createNewToken(admin._id);
        
        // Remove sensitive data
        admin.password = undefined;
        admin.mfaSecret = undefined;

        res.send({
            ...admin._doc,
            token
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { adminLogin }; 