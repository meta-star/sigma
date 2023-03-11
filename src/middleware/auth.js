"use strict";
// Validate "Authorization" header, but it will not interrupt the request.

// To interrupt the request which without the request,
// please use "access.js" middleware.

// Import StatusCodes
const {StatusCodes} = require("http-status-codes");

const {isObjectPropExists} = require("../utils/native");

// Import authMethods
const authMethods = {
    "TEST": async (req, _) =>
        require("../utils/test_token").validateAuthToken(req.auth.secret),
    "SARA": async (req, _) =>
        require("../utils/sara_token").validateAuthToken(req.auth.secret),
};

// Export (function)
module.exports = (req, res, next) => {
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
    if (!isObjectPropExists(authMethods, req.auth.method)) {
        next();
        return;
    }
    authMethods[req.auth.method](req, res)
        .then((result) => {
            if (res.aborted) {
                return;
            }
            if (result && !req.auth.metadata) {
                req.auth.metadata = result;
            }
            if (result && !req.auth.id) {
                req.auth.id =
                    result?.id ||
                    result?.sub ||
                    result?.user?.id ||
                    result?.data?.id ||
                    result?.user?._id ||
                    result?.data?._id ||
                    null;
            }
            next();
        })
        .catch((error) => {
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
            console.error(error);
        });
};
