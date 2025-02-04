import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { logout } from '../../redux/adminSlice';
import axios from 'axios';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalSellers: 0,
        totalProducts: 0,
        totalOrders: 0
    });
    const [users, setUsers] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    const { currentAdmin } = useSelector((state) => state.admin);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentAdmin) {
            navigate('/admin/login');
        }
        fetchDashboardData();
    }, [currentAdmin, navigate]);

    const fetchDashboardData = async () => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${currentAdmin?.token}`
                }
            };

            // Fetch overview statistics
            const [usersRes, sellersRes, productsRes, ordersRes] = await Promise.all([
                axios.get('/api/admin/users', config),
                axios.get('/api/admin/sellers', config),
                axios.get('/api/admin/products', config),
                axios.get('/api/admin/orders', config)
            ]);

            setStats({
                totalUsers: usersRes.data.length,
                totalSellers: sellersRes.data.length,
                totalProducts: productsRes.data.length,
                totalOrders: ordersRes.data.length
            });

            setUsers(usersRes.data);
            setSellers(sellersRes.data);
            setProducts(productsRes.data);
            setOrders(ordersRes.data);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/admin/login');
    };

    const handleUserAction = async (userId, action) => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${currentAdmin?.token}`
                }
            };

            await axios.post(`/api/admin/user/${userId}/${action}`, {}, config);
            fetchDashboardData(); // Refresh data
        } catch (error) {
            console.error(`Error ${action} user:`, error);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md">
                <div className="p-4">
                    <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
                </div>
                <nav className="mt-4">
                    <button
                        className={`w-full p-4 text-left ${activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`w-full p-4 text-left ${activeTab === 'users' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Users Management
                    </button>
                    <button
                        className={`w-full p-4 text-left ${activeTab === 'sellers' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                        onClick={() => setActiveTab('sellers')}
                    >
                        Sellers Management
                    </button>
                    <button
                        className={`w-full p-4 text-left ${activeTab === 'products' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                        onClick={() => setActiveTab('products')}
                    >
                        Products
                    </button>
                    <button
                        className={`w-full p-4 text-left ${activeTab === 'orders' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        Orders
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full p-4 text-left text-red-600 hover:bg-red-50"
                    >
                        Logout
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-8">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-gray-800">Total Users</h3>
                            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalUsers}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-gray-800">Total Sellers</h3>
                            <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalSellers}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-gray-800">Total Products</h3>
                            <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalProducts}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-gray-800">Total Orders</h3>
                            <p className="text-3xl font-bold text-orange-600 mt-2">{stats.totalOrders}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-lg shadow-md">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.accountLocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {user.accountLocked ? 'Locked' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleUserAction(user._id, user.accountLocked ? 'unlock' : 'lock')}
                                                className={`text-sm ${user.accountLocked ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}`}
                                            >
                                                {user.accountLocked ? 'Unlock' : 'Lock'} Account
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Similar tables for sellers, products, and orders */}
                {/* ... Add similar table structures for other tabs ... */}
            </div>
        </div>
    );
};

export default AdminDashboard;