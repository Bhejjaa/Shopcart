import { createSlice } from '@reduxjs/toolkit';

const adminSlice = createSlice({
    name: 'admin',
    initialState: {
        currentAdmin: null,
        isFetching: false,
        error: false,
        mfaRequired: false
    },
    reducers: {
        loginStart: (state) => {
            state.isFetching = true;
            state.error = false;
            state.mfaRequired = false;
        },
        loginSuccess: (state, action) => {
            state.isFetching = false;
            state.currentAdmin = action.payload;
            state.error = false;
            state.mfaRequired = false;
        },
        loginFailure: (state) => {
            state.isFetching = false;
            state.error = true;
        },
        requireMFA: (state) => {
            state.isFetching = false;
            state.mfaRequired = true;
        },
        logout: (state) => {
            state.currentAdmin = null;
            state.error = false;
            state.mfaRequired = false;
        }
    }
});

export const { 
    loginStart, 
    loginSuccess, 
    loginFailure, 
    requireMFA,
    logout 
} = adminSlice.actions;
export default adminSlice.reducer;