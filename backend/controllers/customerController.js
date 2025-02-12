const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');    
const Customer = require('../models/customerSchema.js');
const { createNewToken } = require('../utils/token.js');
const passwordStrengthValidator = require('../middleware/passwordValidator.js');



const customerRegister = async (req, res) => {
    try {
        // Add password validation before registration
        const passwordValidation = passwordStrengthValidator(req.body.password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                message: "Password requirements not met", 
                errors: passwordValidation.errors 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        const customer = new Customer({
            ...req.body,
            password: hashedPass
        });

        const existingcustomerByEmail = await Customer.findOne({ email: req.body.email });

        if (existingcustomerByEmail) {
            return res.status(400).send({ message: 'Email already exists' });
        }

        let result = await customer.save();
        result.password = undefined;
        
        // Create token with role
        const token = jwt.sign(
            { 
                userId: result._id,
                role: 'Customer'
            }, 
            process.env.SECRET_KEY,
            { expiresIn: '10d' }
        );

        result = {
            ...result._doc,
            token: token
        };

        res.status(201).send(result);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


const customerLogIn = async (req, res) => {
    try {
        const customer = await Customer.findOne({ email: req.body.email });
        if (customer) {
            const isMatch = await bcrypt.compare(req.body.password, customer.password);
            if (isMatch) {
                // Set session data
                req.session.userId = customer._id;
                req.session.role = 'Customer';
                
                const token = jwt.sign(
                    { 
                        userId: customer._id,
                        role: 'Customer'
                    }, 
                    process.env.SECRET_KEY,
                    { expiresIn: '10d' }
                );
                
                customer.password = undefined;
                res.send({ ...customer._doc, token });
            } else {
                res.send({ message: "Invalid Password" });
            }
        } else {
            res.send({ message: "Email not found" });
        }
    } catch (err) {
        res.status(500).json(err);
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
}

const cartUpdate = async (req, res) => {
    try {

        let customer = await Customer.findByIdAndUpdate(req.params.id, req.body,
            { new: true })

        return res.send(customer.cartDetails);

    } catch (err) {
        res.status(500).json(err);
    }
}

module.exports = {
    customerRegister,
    customerLogIn,
    getCartDetail,
    cartUpdate,
};
