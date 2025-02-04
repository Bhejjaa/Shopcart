const bcrypt = require('bcrypt');
const Customer = require('../models/customerSchema.js');
const { createNewToken } = require('../utils/token.js');
const { verifyMFAToken, generateMFASecret } = require('../utils/mfa.js');

const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

const customerRegister = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        // Generate MFA secret during registration
        const { secret, qrCode } = await generateMFASecret();

        const customer = new Customer({
            ...req.body,
            password: hashedPass,
            mfaSecret: secret,
            mfaEnabled: false // User needs to enable it later
        });

        const existingcustomerByEmail = await Customer.findOne({ email: req.body.email });

        if (existingcustomerByEmail) {
            res.send({ message: 'Email already exists' });
        } else {
            let result = await customer.save();
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

const customerLogIn = async (req, res) => {
    try {
        const { email, password, mfaToken } = req.body;

        if (!email || !password) {
            return res.status(400).send({ message: "Email and password are required" });
        }

        let customer = await Customer.findOne({ email });
        
        if (!customer) {
            return res.status(404).send({ message: "User not found" });
        }

        // Check if account is locked
        if (customer.accountLocked && customer.lockUntil > Date.now()) {
            return res.status(403).send({ 
                message: `Account is locked. Try again after ${new Date(customer.lockUntil).toLocaleString()}` 
            });
        }

        // Reset lock if lockUntil has expired
        if (customer.accountLocked && customer.lockUntil <= Date.now()) {
            customer.accountLocked = false;
            customer.failedLoginAttempts = 0;
            await customer.save();
        }

        const validated = await bcrypt.compare(password, customer.password);
        
        if (!validated) {
            customer.failedLoginAttempts += 1;
            
            if (customer.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
                customer.accountLocked = true;
                customer.lockUntil = Date.now() + LOCK_TIME;
                await customer.save();
                return res.status(403).send({ 
                    message: "Account locked due to too many failed attempts. Try again after 15 minutes." 
                });
            }
            
            await customer.save();
            return res.status(401).send({ 
                message: `Invalid password. ${MAX_LOGIN_ATTEMPTS - customer.failedLoginAttempts} attempts remaining` 
            });
        }

        // Verify MFA if enabled
        if (customer.mfaEnabled) {
            if (!mfaToken) {
                return res.status(400).send({ 
                    message: "MFA token required",
                    requiresMFA: true 
                });
            }

            const validMFA = verifyMFAToken(customer.mfaSecret, mfaToken);
            if (!validMFA) {
                return res.status(401).send({ message: "Invalid MFA token" });
            }
        }

        // Reset failed attempts on successful login
        customer.failedLoginAttempts = 0;
        await customer.save();

        // Create session token
        const token = createNewToken(customer._id);
        
        // Remove sensitive data
        customer.password = undefined;
        customer.mfaSecret = undefined;

        res.send({
            ...customer._doc,
            token
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

const getCartDetail = async (req, res) => {
    try {
        let customer = await Customer.findById(req.params.id)
        if (customer) {
            res.send(customer.cartDetails);
        }
        else {
            res.send({ message: "No customer found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const cartUpdate = async (req, res) => {
    try {
        let customer = await Customer.findByIdAndUpdate(req.params.id, req.body,
            { new: true })

        return res.send(customer.cartDetails);
    } catch (err) {
        res.status(500).json(err);
    }
};

// New endpoint to enable/disable MFA
const toggleMFA = async (req, res) => {
    try {
        const { customerId, enable, mfaToken } = req.body;

        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).send({ message: "Customer not found" });
        }

        if (enable) {
            // Verify the MFA token before enabling
            const validMFA = verifyMFAToken(customer.mfaSecret, mfaToken);
            if (!validMFA) {
                return res.status(401).send({ message: "Invalid MFA token" });
            }
            customer.mfaEnabled = true;
        } else {
            customer.mfaEnabled = false;
        }

        await customer.save();
        res.send({ message: `MFA ${enable ? 'enabled' : 'disabled'} successfully` });
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = {
    customerRegister,
    customerLogIn,
    getCartDetail,
    cartUpdate,
    toggleMFA
};
