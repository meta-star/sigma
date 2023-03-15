"use strict";
// Token utils for testing/debugging or developing.

// Import config
const {isProduction} = require("../config");

const DEFAULT_FAKE_USER = {
    id: "fake_user",
    nickname: "OpenChat Fake User",
    email: "openchat-fake@web-tech.github.io",
    roles: [],
};

/**
 * Issue function (Auth)
 * @module test_token
 * @function
 * @param {string} [user] - The user to generate the token for.
 * @return {string}
 */
function issueAuthToken(user) {
    if (isProduction()) {
        throw new Error("test_token is not allowed in production");
    }

    user = user || DEFAULT_FAKE_USER;
    return Buffer
        .from(JSON.stringify(user), "utf-8")
        .toString("base64");
}

/**
 * Validate function (Auth)
 * @module test_token
 * @function
 * @param {string} token - The token to valid.
 * @return {boolean|object}
 */
function validateAuthToken(token) {
    if (isProduction()) {
        throw new Error("test_token is not allowed in production");
    }

    return {
        user: JSON.parse(
            Buffer
                .from(token, "base64")
                .toString("utf-8"),
        ),
    };
}

// Export (object)
module.exports = {
    issueAuthToken,
    validateAuthToken,
};
