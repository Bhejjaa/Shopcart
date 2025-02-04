const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware.js');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');
const rbacMiddleware = require('../middleware/rbacMiddleware');
const { adminLogin } = require('../controllers/adminController');

const {
    sellerRegister,
    sellerLogIn,
    toggleMFA: toggleSellerMFA
} = require('../controllers/sellerController.js');

const {
    productCreate,
    getProducts,
    getProductDetail,
    searchProduct,
    searchProductbyCategory,
    searchProductbySubCategory,
    getSellerProducts,
    updateProduct,
    deleteProduct,
    deleteProducts,
    deleteProductReview,
    deleteAllProductReviews,
    addReview,
    getInterestedCustomers,
    getAddedToCartProducts,
} = require('../controllers/productController.js');

const {
    customerRegister,
    customerLogIn,
    getCartDetail,
    cartUpdate,
    toggleMFA: toggleCustomerMFA
} = require('../controllers/customerController.js');

const {
    newOrder,
    getOrderedProductsByCustomer,
    getOrderedProductsBySeller
} = require('../controllers/orderController.js');


// Seller
router.post('/SellerRegister', registerLimiter, sellerRegister);
router.post('/SellerLogin', loginLimiter, sellerLogIn);
router.post('/Seller/toggleMFA', authMiddleware, toggleSellerMFA);

// Product
router.post('/ProductCreate', authMiddleware, rbacMiddleware('manage_products'), productCreate);
router.get('/getSellerProducts/:id', getSellerProducts);
router.get('/getProducts', getProducts);
router.get('/getProductDetail/:id', getProductDetail);
router.get('/getInterestedCustomers/:id', getInterestedCustomers);
router.get('/getAddedToCartProducts/:id', getAddedToCartProducts);

router.put('/ProductUpdate/:id', authMiddleware, rbacMiddleware('manage_products'), updateProduct);
router.put('/addReview/:id', addReview);

router.get('/searchProduct/:key', searchProduct);
router.get('/searchProductbyCategory/:key', searchProductbyCategory);
router.get('/searchProductbySubCategory/:key', searchProductbySubCategory);

router.delete('/DeleteProduct/:id', authMiddleware, rbacMiddleware('manage_products'), deleteProduct);
router.delete('/DeleteProducts/:id', deleteProducts);
router.put('/deleteProductReview/:id', deleteProductReview);
router.delete('/deleteAllProductReviews/:id', deleteAllProductReviews);

// Customer
router.post('/CustomerRegister', registerLimiter, customerRegister);
router.post('/CustomerLogin', loginLimiter, customerLogIn);
router.get('/getCartDetail/:id', getCartDetail);
router.put('/CustomerUpdate/:id', cartUpdate);
router.post('/Customer/toggleMFA', authMiddleware, toggleCustomerMFA);

// Order
router.post('/newOrder', newOrder);
router.get('/getOrderedProductsByCustomer/:id', getOrderedProductsByCustomer);
router.get('/getOrderedProductsBySeller/:id', getOrderedProductsBySeller);

// Add the toggleMFA route handler for both Customer and Seller
router.post("/Customer/toggleMFA", toggleCustomerMFA);
router.post("/Seller/toggleMFA", toggleSellerMFA);

// Admin routes
router.post('/AdminLogin', loginLimiter, adminLogin);

router.get('/admin/users', authMiddleware, rbacMiddleware('all'), async (req, res) => {
    try {
        const users = await Customer.find({}, '-password -mfaSecret');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

router.get('/admin/sellers', authMiddleware, rbacMiddleware('all'), async (req, res) => {
    try {
        const sellers = await Seller.find({}, '-password -mfaSecret');
        res.json(sellers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sellers' });
    }
});

router.get('/admin/products', authMiddleware, rbacMiddleware('all'), async (req, res) => {
    try {
        const products = await Product.find().populate('seller', 'shopName');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products' });
    }
});

router.get('/admin/orders', authMiddleware, rbacMiddleware('all'), async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('buyer', 'name email')
            .populate('orderedProducts.seller', 'shopName');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

router.post('/admin/user/:userId/:action', authMiddleware, rbacMiddleware('all'), async (req, res) => {
    try {
        const { userId, action } = req.params;
        const user = await Customer.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (action === 'lock') {
            user.accountLocked = true;
            user.lockUntil = Date.now() + (24 * 60 * 60 * 1000); // Lock for 24 hours
        } else if (action === 'unlock') {
            user.accountLocked = false;
            user.failedLoginAttempts = 0;
            user.lockUntil = null;
        }

        await user.save();
        res.json({ message: `User account ${action}ed successfully` });
    } catch (error) {
        res.status(500).json({ message: `Error ${action}ing user account` });
    }
});

module.exports = router;