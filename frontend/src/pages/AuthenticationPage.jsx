import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Box, Typography, Paper, Checkbox, FormControlLabel, TextField, CssBaseline, IconButton, InputAdornment, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { LightPurpleButton } from '../utils/buttonStyles';
import { authUser } from '../redux/userHandle';
import styled from 'styled-components';
import Popup from '../components/Popup';
import axios from 'axios';

const REACT_APP_BASE_URL = "http://localhost:5000";

const AuthenticationPage = ({ mode, role }) => {

    const bgpic = "https://images.pexels.com/photos/1121097/pexels-photo-1121097.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { status, currentUser, response, error, currentRole } = useSelector(state => state.user);;

    const [toggle, setToggle] = useState(false)
    const [loader, setLoader] = useState(false)
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [userNameError, setUserNameError] = useState(false);
    const [shopNameError, setShopNameError] = useState(false);

    const [requiresMFA, setRequiresMFA] = useState(false);
    const [mfaToken, setMfaToken] = useState("");

    const [showQRCode, setShowQRCode] = useState(false);
    const [qrCodeData, setQRCodeData] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoader(true);

        const email = event.target.email.value;
        const password = event.target.password.value;

        if (!email || !password) {
            if (!email) setEmailError(true);
            if (!password) setPasswordError(true);
            setLoader(false);
            return;
        }

        try {
            if (mode === "Register") {
                const name = event.target.userName.value;
                if (!name) {
                    setUserNameError(true);
                    setLoader(false);
                    return;
                }

                const fields = role === "Seller" 
                    ? { name, email, password, role, shopName: event.target.shopName.value }
                    : { name, email, password, role };

                const response = await dispatch(authUser(fields, role, mode));
                if (response?.success && response?.qrCode) {
                    setQRCodeData(response.qrCode);
                    setShowQRCode(true);
                    setMessage("Scan this QR code with Google Authenticator to enable MFA later");
                    setShowPopup(true);
                    setLoader(false);
                }
            } else if (mode === "Login") {
                const loginFields = {
                    email,
                    password,
                    mfaToken: requiresMFA ? mfaToken : undefined
                };
                const response = await dispatch(authUser(loginFields, role, mode));
                
                if (response?.requiresMFA) {
                    setRequiresMFA(true);
                    setMessage("Please enter your MFA code");
                    setShowPopup(true);
                    setLoader(false);
                    return;
                }
            }
        } catch (error) {
            setMessage("An error occurred");
            setShowPopup(true);
            setLoader(false);
        }
    };

    const handleInputChange = (event) => {
        const { name } = event.target;
        if (name === 'email') setEmailError(false);
        if (name === 'password') setPasswordError(false);
        if (name === 'userName') setUserNameError(false);
        if (name === 'shopName') setShopNameError(false);
    };

    useEffect(() => {
        if (status === 'success' && currentRole !== null && !showQRCode) {
            navigate('/');
        }
        else if (status === 'failed') {
            setMessage(response)
            setShowPopup(true)
            setLoader(false)
        }
        else if (status === 'error') {
            setLoader(false)
            setMessage("Network Error")
            setShowPopup(true)
        }
    }, [status, currentUser, currentRole, navigate, error, response, showQRCode]);

    return (
        <>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <StyledTypography>
                            {role} {mode}
                        </StyledTypography>

                        {role === "Seller" && mode === "Register" &&
                            <Typography variant="h7">
                                Create your own shop by registering as an seller.
                                <br />
                                You will be able to add products and sell them.
                            </Typography>
                        }

                        {role === "Customer" && mode === "Register" &&
                            <Typography variant="h7">
                                Register now to explore and buy products.
                            </Typography>
                        }

                        {mode === "Login" &&
                            <Typography variant="h7">
                                Welcome back! Please enter your details
                            </Typography>
                        }

                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 2 }}>
                            {showQRCode && (
                                <Box sx={{ 
                                    mb: 4, 
                                    p: 3, 
                                    border: '1px solid #e0e0e0', 
                                    borderRadius: 2,
                                    backgroundColor: '#f5f5f5',
                                    textAlign: 'center' 
                                }}>
                                    <Typography variant="h6" sx={{ mb: 2, color: '#5c35c7' }}>
                                        Important: Save your MFA Setup
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        1. Install Google Authenticator on your phone
                                        2. Scan this QR code to enable MFA
                                        3. Keep this code safe - you'll need it to log in
                                    </Typography>
                                    <img 
                                        src={qrCodeData} 
                                        alt="MFA QR Code" 
                                        style={{ 
                                            maxWidth: '200px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            padding: '8px',
                                            backgroundColor: 'white'
                                        }} 
                                    />
                                </Box>
                            )}
                            {showQRCode && (
                                <>
                                    <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                                        Enter the code from Google Authenticator to enable MFA:
                                    </Typography>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        name="mfaToken"
                                        label="Enter 6-digit code"
                                        type="text"
                                        value={mfaToken}
                                        onChange={(e) => setMfaToken(e.target.value)}
                                    />
                                    <LightPurpleButton
                                        fullWidth
                                        variant="contained"
                                        sx={{ mt: 2 }}
                                        onClick={async () => {
                                            try {
                                                const response = await axios.post(`${REACT_APP_BASE_URL}/${role}/toggleMFA`, {
                                                    [`${role.toLowerCase()}Id`]: currentUser._id,
                                                    enable: true,
                                                    mfaToken: mfaToken
                                                });
                                                setMessage(response.data.message);
                                                setShowPopup(true);
                                                navigate('/');
                                            } catch (error) {
                                                setMessage(error.response?.data?.message || "Error enabling MFA");
                                                setShowPopup(true);
                                            }
                                        }}
                                    >
                                        Enable MFA
                                    </LightPurpleButton>
                                </>
                            )}
                            {mode === "Register" &&
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="userName"
                                    label="Enter your name"
                                    name="userName"
                                    autoComplete="name"
                                    autoFocus
                                    variant="standard"
                                    error={userNameError}
                                    helperText={userNameError && 'Name is required'}
                                    onChange={handleInputChange}
                                />
                            }
                            {mode === "Register" && role === "Seller" &&
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="shopName"
                                    label="Create your shop name"
                                    name="shopName"
                                    autoComplete="off"
                                    variant="standard"
                                    error={shopNameError}
                                    helperText={shopNameError && 'Shop name is required'}
                                    onChange={handleInputChange}
                                />
                            }
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Enter your email"
                                name="email"
                                autoComplete="email"
                                variant="standard"
                                error={emailError}
                                helperText={emailError && 'Email is required'}
                                onChange={handleInputChange}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type={toggle ? 'text' : 'password'}
                                id="password"
                                autoComplete="current-password"
                                variant="standard"
                                error={passwordError}
                                helperText={passwordError && 'Password is required'}
                                onChange={handleInputChange}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setToggle(!toggle)}>
                                                {toggle ? (
                                                    <Visibility />
                                                ) : (
                                                    <VisibilityOff />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            {mode === "Login" && requiresMFA && (
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="mfaToken"
                                    label="Enter 6-digit code from Google Authenticator"
                                    type="text"
                                    id="mfaToken"
                                    value={mfaToken}
                                    onChange={(e) => setMfaToken(e.target.value)}
                                    autoComplete="off"
                                />
                            )}
                            <Grid container sx={{ display: "flex", justifyContent: "space-between" }}>
                                <FormControlLabel
                                    control={<Checkbox value="remember" color="primary" />}
                                    label="Remember me"
                                />
                            </Grid>
                            <LightPurpleButton
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : mode}
                            </LightPurpleButton>
                            <Grid container>
                                <Grid>
                                    {mode === "Register" ?
                                        "Already have an account?"
                                        :
                                        "Don't have an account?"
                                    }
                                </Grid>
                                <Grid item sx={{ ml: 2 }}>
                                    {mode === "Register" ?
                                        <StyledLink to={`/${role}login`}>
                                            Log in
                                        </StyledLink>
                                        :
                                        <StyledLink to={`/${role}register`}>
                                            Sign up
                                        </StyledLink>
                                    }
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Grid>
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: `url(${bgpic})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
            </Grid>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
}

export default AuthenticationPage

const StyledLink = styled(Link)`
  margin-top: 9px;
  text-decoration: none;
  color: #7f56da;
`;

const StyledTypography = styled.h4`
    margin: 0;
    font-weight: 400;
    font-size: 2.125rem;
    line-height: 1.235;
    letter-spacing: 0.00735em;
    color: #2c2143;
    margin-bottom: 16px;
`;
