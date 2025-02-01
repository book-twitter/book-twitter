const express = require('express');
const cors = require('cors');
const compression = require('compression');
const env = require('dotenv').config().parsed;

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1)

//Setup JsonParser
app.use(express.json());

//Enable gzip compression
app.use(compression())

//Enable CORS
app.use(cors());

//Setup routing
const authRoute = require('./routes/AuthRoute');

app.use("/auth/", authRoute);

app.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}`));