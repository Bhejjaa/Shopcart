const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const limiter = require('./middleware/rateLimiter')
const { securityMiddleware } = require('./config/security');
const authMiddleware = require('./middleware/authMiddleware');
const rbacMiddleware = require('./middleware/rbacMiddleware');



const app = express()
const Routes = require("./routes/route.js")

const PORT = process.env.PORT || 5000


dotenv.config();


app.use(express.json({ limit: '10mb' }))
app.use(cors())



mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(console.log("Connected to MongoDB"))
    .catch((err) => console.log("NOT CONNECTED TO NETWORK", err))

app.use('/', Routes);

app.listen(PORT, () => {
    console.log(`Server started at port no. ${PORT}`)
})