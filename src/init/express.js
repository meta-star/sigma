"use strict";

// Import express.js
const express = require('express');

module.exports = (ctx) => {
    // Initialize App Engine
    const app = express();

    // General Middlewares
    app.use(require('request-ip').mw());
    app.use(require('../middlewares/auth')(ctx));

    // Request Body Parser
    app.use(express.urlencoded({extended: true}));

    // Option Middlewares
    if (process.env.HTTPS_REDIRECT === 'yes') {
        app.use(require('../middlewares/https_redirect'));
    }
    if (process.env.HTTP_CORS === 'yes') {
        const cors = require('cors');
        const cors_handler = cors({
            origin: process.env.WEBSITE_URL,
            exposedHeaders: ['Sara-Issue']
        });
        app.use(cors_handler);
    }

    // Return App Engine
    return app;
};
