const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const generateMFASecret = async () => {
    const secret = speakeasy.generateSecret({
        name: 'ShopCart'
    });
    
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    
    return {
        secret: secret.base32,
        qrCode
    };
};

const verifyMFAToken = (secret, token) => {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 1
    });
};

module.exports = { generateMFASecret, verifyMFAToken }; 