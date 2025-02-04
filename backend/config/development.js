const corsDevOptions = {
    origin: true, // Allow all origins in development
    credentials: true,
    exposedHeaders: ['Authorization']
};

const helmetDevConfig = {
    contentSecurityPolicy: false, // Disable CSP in development
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
};

module.exports = {
    corsDevOptions,
    helmetDevConfig
}; 