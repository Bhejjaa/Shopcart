const bcrypt = require('bcrypt');
const Seller = require('../models/sellerSchema.js');
const { createNewToken } = require('../utils/token.js');
const { verifyMFAToken, generateMFASecret } = require('../utils/mfa.js');

const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

const sellerRegister = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        // Generate MFA secret during registration
        const { secret, qrCode } = await generateMFASecret();

        const seller = new Seller({
            ...req.body,
            password: hashedPass,
            mfaSecret: secret,
            mfaEnabled: false // User needs to enable it later
        });

        const existingSellerByEmail = await Seller.findOne({ email: req.body.email });
        const existingShop = await Seller.findOne({ shopName: req.body.shopName });

        if (existingSellerByEmail) {
            res.send({ message: 'Email already exists' });
        }
        else if (existingShop) {
            res.send({ message: 'Shop name already exists' });
        }
        else {
            let result = await seller.save();
            result.password = undefined;
            result.mfaSecret = undefined;

            const token = createNewToken(result._id);

            result = {
                ...result._doc,
                token: token,
                qrCode: qrCode // Send QR code for MFA setup
            };

            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const sellerLogIn = async (req, res) => {
    try {
        const { email, password, mfaToken } = req.body;

        if (!email || !password) {
            return res.status(400).send({ message: "Email and password are required" });
        }

        let seller = await Seller.findOne({ email });
        
        if (!seller) {
            return res.status(404).send({ message: "User not found" });
        }

        // Check if account is locked
        if (seller.accountLocked && seller.lockUntil > Date.now()) {
            return res.status(403).send({ 
                message: `Account is locked. Try again after ${new Date(seller.lockUntil).toLocaleString()}` 
            });
        }

        // Reset lock if lockUntil has expired
        if (seller.accountLocked && seller.lockUntil <= Date.now()) {
            seller.accountLocked = false;
            seller.failedLoginAttempts = 0;
            await seller.save();
        }

        const validated = await bcrypt.compare(password, seller.password);
        
        if (!validated) {
            seller.failedLoginAttempts += 1;
            
            if (seller.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
                seller.accountLocked = true;
                seller.lockUntil = Date.now() + LOCK_TIME;
                await seller.save();
                return res.status(403).send({ 
                    message: "Account locked due to too many failed attempts. Try again after 15 minutes." 
                });
            }
            
            await seller.save();
            return res.status(401).send({ 
                message: `Invalid password. ${MAX_LOGIN_ATTEMPTS - seller.failedLoginAttempts} attempts remaining` 
            });
        }

        // Verify MFA if enabled
        if (seller.mfaEnabled) {
            if (!mfaToken) {
                return res.status(400).send({ 
                    message: "MFA token required",
                    requiresMFA: true 
                });
            }

            const validMFA = verifyMFAToken(seller.mfaSecret, mfaToken);
            if (!validMFA) {
                return res.status(401).send({ message: "Invalid MFA token" });
            }
        }

        // Reset failed attempts on successful login
        seller.failedLoginAttempts = 0;
        await seller.save();

        // Create session token
        const token = createNewToken(seller._id);
        
        // Remove sensitive data
        seller.password = undefined;
        seller.mfaSecret = undefined;

        res.send({
            ...seller._doc,
            token
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

// New endpoint to enable/disable MFA
const toggleMFA = async (req, res) => {
    try {
        const { sellerId, enable, mfaToken } = req.body;

        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return res.status(404).send({ message: "Seller not found" });
        }

        if (enable) {
            // Verify the MFA token before enabling
            const validMFA = verifyMFAToken(seller.mfaSecret, mfaToken);
            if (!validMFA) {
                return res.status(401).send({ message: "Invalid MFA token" });
            }
            seller.mfaEnabled = true;
        } else {
            seller.mfaEnabled = false;
        }

        await seller.save();
        res.send({ message: `MFA ${enable ? 'enabled' : 'disabled'} successfully` });
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { 
    sellerRegister, 
    sellerLogIn,
    toggleMFA
};
