"use strict";
// Validate "Authorization" header, but it will not interrupt the request.

// To interrupt the request which without the request,
// please use "access.js" middleware.

// Import StatusCodes
const {StatusCodes} = require("http-status-codes");

// Import authMethods
const authMethods = {
    "SARA": async (ctx, req, _) =>
        require("../utils/sara_token").validateAuthToken(ctx, req.auth.secret),
};

// Export (function)
module.exports = (ctx) => function(req, res, next) {
    const authCode = req.header("Authorization");
    if (!authCode) {
        next();
        return;
    }
    const params = authCode.split(" ");
    if (params.length !== 2) {
        next();
        return;
    }
    req.auth = {
        id: null,
        metadata: null,
        method: params[0],
        secret: params[1],
    };
    if (!(req.auth.method in authMethods)) {
        next();
        return;
    }
    authMethods[req.auth.method](ctx, req, res)
        .then((result) => {
            if (!req.auth.metadata) {
                req.auth.metadata = result;
            }
            next();
        })
        .catch((error) => {
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
            console.error(error);
        });
};
