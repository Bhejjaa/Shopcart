import axiosRetry from 'axios-retry';
import axios from 'axios';
import {
    authRequest,
    authSuccess,
    authFailed,
    authError,
    stuffAdded,
    getDeleteSuccess,
    getRequest,
    getFailed,
    getError,
    productSuccess,
    productDetailsSuccess,
    getProductDetailsFailed,
    getProductsFailed,
    setFilteredProducts,
    getSearchFailed,
    sellerProductSuccess,
    getSellerProductsFailed,
    stuffUpdated,
    updateFailed,
    getCustomersListFailed,
    customersListSuccess,
    getSpecificProductsFailed,
    specificProductSuccess,
    updateCurrentUser,
} from './userSlice';

axiosRetry(axios, { 
    retries: 2,
    retryDelay: (retryCount) => {
        return retryCount * 1000; // time interval between retries
    },
    retryCondition: (error) => {
        // Retry only on rate limit errors (429)
        return error.response?.status === 429;
    }
});

const getCsrfToken = async () => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/csrf-token`, {
            withCredentials: true
        });
        return response.data.csrfToken;
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
        return null;
    }
};



export const authUser = (fields, role, mode) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/${role}${mode}`, fields);
        if (result.data.token) {
            // Store token in localStorage
            localStorage.setItem('token', result.data.token);
            dispatch(authSuccess(result.data));
        } else {
            dispatch(authFailed(result.data.message));
        }
    } catch (error) {
        if (error.response?.status === 429) {
            dispatch(authFailed("Too many attempts. Please try again later."));
        } else {
            dispatch(authError({
                message: error.response?.data?.message || "An error occurred",
                status: error.response?.status
            }));
        }
    }
};

export const addStuff = (address, fields) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/${address}`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (result.data.message) {
            dispatch(authFailed(result.data.message));
        } else {
            dispatch(stuffAdded());
        }
    } catch (error) {
        dispatch(authError(error));
    }
};

export const updateStuff = (fields, id, address) => async (dispatch) => {
    try {
        const token = localStorage.getItem('token');
        
        const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`, fields, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (result.data.message) {
            dispatch(updateFailed(result.data.message));
        } else {
            dispatch(stuffUpdated());
        }
    } catch (error) {
        dispatch(getError({
            message: error.response?.data?.message || "An error occurred",
            status: error.response?.status
        }));
    }
};

export const deleteStuff = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.delete(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getDeleteSuccess());
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const updateCustomer = (fields, id) => async (dispatch) => {
    try {
        const csrfToken = await getCsrfToken();
        const token = localStorage.getItem('token');

        const response = await axios.put(
            `${process.env.REACT_APP_BASE_URL}/CustomerUpdate/${id}`, 
            fields,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-Token': csrfToken,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }
        );
        dispatch(updateCurrentUser(response.data));
    } catch (error) {
        dispatch(getError({
            message: error.response?.data?.message || "An error occurred",
            status: error.response?.status
        }));
    }
};


export const getProductsbySeller = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/getSellerProducts/${id}`);
        if (result.data.message) {
            dispatch(getSellerProductsFailed(result.data.message));
        }
        else {
            dispatch(sellerProductSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getProducts = () => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/getProducts`);
        if (result.data.message) {
            dispatch(getProductsFailed(result.data.message));
        }
        else {
            dispatch(productSuccess(result.data));
        }
    } catch (error) {
        // Modify error handling to avoid non-serializable error objects
        dispatch(getError({
            message: error.message,
            status: error.response?.status
        }));
    }
}

// Add this validation endpoint
export const validatePassword = async (password) => {
    try {
        const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/validate-password`, { password });
        return response.data;
    } catch (error) {
        console.error('Password validation failed:', error);
        return {
            isValid: false,
            errors: ['Password validation failed'],
            strength: 0
        };
    }
};

export const getProductDetails = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/getProductDetail/${id}`);
        if (result.data.message) {
            dispatch(getProductDetailsFailed(result.data.message));
        }
        else {
            dispatch(productDetailsSuccess(result.data));
        }

    } catch (error) {
        dispatch(getError(error));
    }
}

export const getCustomers = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data.message) {
            dispatch(getCustomersListFailed(result.data.message));
        }
        else {
            dispatch(customersListSuccess(result.data));
        }

    } catch (error) {
        dispatch(getError(error));
    }
}

export const getSpecificProducts = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data.message) {
            dispatch(getSpecificProductsFailed(result.data.message));
        }
        else {
            dispatch(specificProductSuccess(result.data));
        }

    } catch (error) {
        dispatch(getError(error));
    }
}

export const getSearchedProducts = (address, key) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/${address}/${key}`);
        if (result.data.message) {
            dispatch(getSearchFailed(result.data.message));
        }
        else {
            dispatch(setFilteredProducts(result.data));
        }

    } catch (error) {
        dispatch(getError(error));
    }
};

