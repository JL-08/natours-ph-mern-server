const express = require('express');
const cors = require('cors');

const userRouter = require('./routes/userRoutes');

const app = express();

// GLOBAL MIDDLEWARES
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ROUTES
app.use('/api/v1/users', userRouter);

module.exports = app;
