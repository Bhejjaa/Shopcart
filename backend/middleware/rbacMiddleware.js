const ROLE_PERMISSIONS = {
    Admin: ['all'],
    Seller: ['manage_products', 'view_orders', 'manage_shop'],
    Customer: ['place_order', 'manage_cart', 'write_review']
};

const rbacMiddleware = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const userRole = req.user.role;
            
            // Admins have access to everything
            if (userRole === 'Admin') {
                return next();
            }

            const userPermissions = ROLE_PERMISSIONS[userRole] || [];
            
            if (userPermissions.includes(requiredPermission)) {
                next();
            } else {
                res.status(403).json({ 
                    message: 'Access denied: Insufficient permissions' 
                });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error checking permissions' });
        }
    };
};

module.exports = rbacMiddleware; 