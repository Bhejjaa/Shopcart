import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Grid, 
    Box, 
    Typography, 
    Paper, 
    Checkbox, 
    FormControlLabel, 
    TextField, 
    CssBaseline, 
    IconButton, 
    InputAdornment, 
    CircularProgress,
    LinearProgress 
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { LightPurpleButton } from '../utils/buttonStyles';
import { authUser } from '../redux/userHandle';
import styled from 'styled-components';
import Popup from '../components/Popup';

const AuthenticationPage = ({ mode, role }) => {
    const bgpic = "https://images.pexels.com/photos/1121097/pexels-photo-1121097.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { status, currentUser, response, error, currentRole } = useSelector(state => state.user);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        userName: '',
        shopName: ''
    });

    const [toggle, setToggle] = useState(false)
    const [loader, setLoader] = useState(false)
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [userNameError, setUserNameError] = useState(false);
    const [shopNameError, setShopNameError] = useState(false);

    // New state variables for password validation
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordFeedback, setPasswordFeedback] = useState([]);

    const handleSubmit = (event) => {
        event.preventDefault();

        const email = event.target.email.value;
        const password = event.target.password.value;

        if (!email || !password) {
            if (!email) setEmailError(true);
            if (!password) setPasswordError(true);
            return;
        }

        // Add password validation check before submission
        if (mode === "Register" && passwordFeedback.length > 0) {
            setMessage("Please meet all password requirements");
            setShowPopup(true);
            return;
        }
    
        setLoader(true);
    
        if (mode === "Register") {
            const name = event.target.userName.value;
    
            if (!name) {
                setUserNameError(true);
                setLoader(false);
                return;
            }
    
            if (role === "Seller") {
                const shopName = event.target.shopName.value;
    
                if (!shopName) {
                    setShopNameError(true);
                    setLoader(false);
                    return;
                }
    
                const sellerFields = { name, email, password, role, shopName }
                dispatch(authUser(sellerFields, role, mode))
            } else {
                const customerFields = { name, email, password, role }
                dispatch(authUser(customerFields, role, mode))
            }
        } else if (mode === "Login") {
            const fields = { email, password }
            dispatch(authUser(fields, role, mode))
        }
    };
    

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));

        if (name === 'email') setEmailError(false);
        if (name === 'password') setPasswordError(false);
        if (name === 'userName') setUserNameError(false);
        if (name === 'shopName') setShopNameError(false);
    };

    const handlePasswordChange = async (event) => {
        const password = event.target.value;
        
        // Update form data first
        setFormData(prevData => ({
            ...prevData,
            password: password
        }));
        
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/validate-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });
            
            const data = await response.json();
            setPasswordStrength(data.strength);
            setPasswordFeedback(data.errors);
            setPasswordError(data.errors.length > 0);
        } catch (error) {
            console.error('Password validation failed:', error);
        }
    };

    useEffect(() => {
        if (status === 'success' && currentRole !== null) {
            navigate('/');
        }
        else if (status === 'failed') {
            setMessage(response)
            setShowPopup(true)
            setLoader(false)
        }
        else if (status === 'error') {
            setLoader(false)
            // Handle rate limit error specifically
            if (error?.status === 429) {
                setMessage("Too many attempts. Please try again later.");
            } else {
                setMessage("Network Error");
            }
            setShowPopup(true)
        }
    }, [status, currentUser, currentRole, navigate, error, response]);

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
                                    value={formData.userName}
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
                                    value={formData.shopName}
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
                                value={formData.email}
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
                                value={formData.password}
                                autoComplete="current-password"
                                variant="standard"
                                error={passwordError}
                                helperText={
                                    passwordFeedback.length > 0 ? 
                                    passwordFeedback.map((error, index) => (
                                        <span key={index}>{error}<br/></span>
                                    )) : 
                                    (passwordError && 'Password is required')
                                }
                                onChange={handlePasswordChange}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setToggle(!toggle)}>
                                                {toggle ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Password strength indicator */}
                            {mode === "Register" && formData.password && (
                                <Box sx={{ width: '100%', mt: 1 }}>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={passwordStrength}
                                        sx={{
                                            backgroundColor: '#e0e0e0',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: 
                                                    passwordStrength <= 25 ? '#f44336' :
                                                    passwordStrength <= 50 ? '#ff9800' :
                                                    passwordStrength <= 75 ? '#ffc107' :
                                                    '#4caf50',
                                            }
                                        }}
                                    />
                                    <Typography variant="caption" color="textSecondary">
                                        Password Strength: {
                                            passwordStrength <= 25 ? 'Weak' :
                                            passwordStrength <= 50 ? 'Fair' :
                                            passwordStrength <= 75 ? 'Good' :
                                            'Strong'
                                        }
                                    </Typography>
                                </Box>
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

export default AuthenticationPage;

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