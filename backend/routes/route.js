const router = require('express').Router();
const authorize = require('../middleware/authMiddleware');
const passwordStrengthValidator = require('../middleware/passwordValidator');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');
const { validateRegistration, validateLogin } = require('../middleware/inputValidator');
const validateSession = require('../middleware/sessionMiddleware');


const {
    sellerRegister,
    sellerLogIn
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
    cartUpdate
} = require('../controllers/customerController.js');

const {
    newOrder,
    getOrderedProductsByCustomer,
    getOrderedProductsBySeller
} = require('../controllers/orderController.js');

// Public Routes (No Authorization Required)
router.post('/validate-password', (req, res) => {
    const { password } = req.body;
    const validationResult = passwordStrengthValidator(password);
    res.json(validationResult);
});

// Authentication Routes with Rate Limiting
router.post('/SellerRegister', registerLimiter, validateRegistration,sellerRegister);
router.post('/SellerLogin', loginLimiter, validateLogin,sellerLogIn);
router.post('/CustomerRegister', registerLimiter,  validateRegistration,customerRegister);
router.post('/CustomerLogin', loginLimiter,  validateLogin,customerLogIn);

// Public Product Routes
router.get('/getProducts', getProducts);
router.get('/getProductDetail/:id', getProductDetail);
router.get('/searchProduct/:key', searchProduct);
router.get('/searchProductbyCategory/:key', searchProductbyCategory);
router.get('/searchProductbySubCategory/:key', searchProductbySubCategory);

// Protected Seller Routes
router.post('/ProductCreate', authorize('Seller'), productCreate);
router.get('/getSellerProducts/:id', authorize('Seller'), getSellerProducts);
router.put('/ProductUpdate/:id', authorize('Seller'), updateProduct);
router.delete('/DeleteProduct/:id', authorize('Seller'), deleteProduct);
router.delete('/DeleteProducts/:id', authorize('Seller'), deleteProducts);
router.get('/getInterestedCustomers/:id', authorize('Seller'), getInterestedCustomers);
router.get('/getAddedToCartProducts/:id', authorize('Seller'), getAddedToCartProducts);
router.put('/deleteProductReview/:id', authorize('Seller'), deleteProductReview);
router.delete('/deleteAllProductReviews/:id', authorize('Seller'), deleteAllProductReviews);
router.get('/getOrderedProductsBySeller/:id', authorize('Seller'), getOrderedProductsBySeller);

// Protected Customer Routes
router.post('/newOrder', authorize('Customer'), newOrder);
router.get('/getCartDetail/:id', authorize('Customer'), getCartDetail);
router.put('/CustomerUpdate/:id', authorize('Customer'), cartUpdate);
router.put('/addReview/:id', authorize('Customer'), addReview);
router.get('/getOrderedProductsByCustomer/:id', authorize('Customer'), getOrderedProductsByCustomer);

router.post('/logout', validateSession, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
});

module.exports = router;