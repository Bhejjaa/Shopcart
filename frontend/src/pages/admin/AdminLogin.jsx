import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure, requireMFA } from '../../redux/adminSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mfaToken, setMfaToken] = useState('');
    const { isFetching, error, mfaRequired } = useSelector((state) => state.admin);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(loginStart());

        try {
            const res = await axios.post('/api/AdminLogin', {
                email,
                password,
                mfaToken
            });

            if (res.data.requiresMFA) {
                dispatch(requireMFA());
                return;
            }

            dispatch(loginSuccess(res.data));
            navigate('/admin/dashboard');
        } catch (err) {
            dispatch(loginFailure());
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    {mfaRequired && (
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="MFA Token"
                                value={mfaToken}
                                onChange={(e) => setMfaToken(e.target.value)}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isFetching}
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        {isFetching ? 'Loading...' : 'Login'}
                    </button>
                    {error && (
                        <p className="text-red-500 text-center mt-2">
                            Something went wrong!
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;