import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Home from './pages/Home'
import ViewProduct from './pages/ViewProduct'
import Navbar from './pages/Navbar'
import AuthenticationPage from './pages/AuthenticationPage'
import SellerDashboard from './pages/seller/SellerDashboard'
import CustomerSearch from './pages/customer/pages/CustomerSearch'
import Products from './components/Products';
import { useEffect } from 'react';
import { getProducts } from './redux/userHandle';
import CustomerOrders from './pages/customer/pages/CustomerOrders';
import CheckoutSteps from './pages/customer/pages/CheckoutSteps';
import Profile from './pages/customer/pages/Profile';
import Logout from './pages/Logout';
import { isTokenValid } from './redux/userSlice';
import CheckoutAftermath from './pages/customer/pages/CheckoutAftermath';
import ViewOrder from './pages/customer/pages/ViewOrder';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

const App = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoggedIn, currentToken, currentRole, productData } = useSelector(state => state.user);
  const { currentAdmin } = useSelector(state => state.admin);

  useEffect(() => {
    dispatch(getProducts());

    if (currentToken) {
      dispatch(isTokenValid());
    }
  }, [dispatch, currentToken]);

  return (
    <>
      {(!isLoggedIn && currentRole === null && !currentAdmin) &&
        <>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Home" element={<Home />} />
            <Route path="/admin/login" element={<AuthenticationPage mode="Login" role="Admin" />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path='*' element={<Navigate to="/" />} />

            <Route path="/Products" element={<Products productData={productData} />} />
            <Route path="/product/view/:id" element={<ViewProduct />} />
            <Route path="/Search" element={<CustomerSearch mode="Mobile" />} />
            <Route path="/ProductSearch" element={<CustomerSearch mode="Desktop" />} />
            <Route path="/Customerregister" element={<AuthenticationPage mode="Register" role="Customer" />} />
            <Route path="/Customerlogin" element={<AuthenticationPage mode="Login" role="Customer" />} />
            <Route path="/Sellerregister" element={<AuthenticationPage mode="Register" role="Seller" />} />
            <Route path="/Sellerlogin" element={<AuthenticationPage mode="Login" role="Seller" />} />
          </Routes>
        </>
      }

      {(isLoggedIn && currentRole === "Customer") &&
        <>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Home" element={<Home />} />
            <Route path='*' element={<Navigate to="/" />} />
            <Route path="/Products" element={<Products productData={productData} />} />
            <Route path="/product/view/:id" element={<ViewProduct />} />
            <Route path="/Search" element={<CustomerSearch mode="Mobile" />} />
            <Route path="/ProductSearch" element={<CustomerSearch mode="Desktop" />} />
            <Route path="/Checkout" element={<CheckoutSteps />} />
            <Route path="/product/buy/:id" element={<CheckoutSteps />} />
            <Route path="/Aftermath" element={<CheckoutAftermath />} />
            <Route path="/Profile" element={<Profile />} />
            <Route path="/Orders" element={<CustomerOrders />} />
            <Route path="/order/view/:id" element={<ViewOrder />} />
            <Route path="/Logout" element={<Logout />} />
          </Routes>
        </>
      }

      {(isLoggedIn && (currentRole === "Seller" || currentRole === "Shopcart")) && (
        <>
          <SellerDashboard />
        </>
      )}

      {currentAdmin && (
        <Routes>
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" />} />
        </Routes>
      )}
    </>
  )
}

export default App