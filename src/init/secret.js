"use strict";
// Check the "secret.key" whether safe or not.

// Import config
const {get} = require("../config");

// Import fs
const fs = require("node:fs");

// Import constant
const constant = require("./const");

// Define generate commands
const generateCommandNative = "npm run new-secret";
const generateCommandContainer = "touch ./secret.key && " +
    "docker run -v $PWD/secret.key:/workplace/secret.key $APP_IMAGE_NAME " +
    "npm run new-secret";

// Detect the command for generate secret
const isContainer = get("RUNTIME_ENV") === "container";
const generateCommand = !isContainer ?
    generateCommandNative :
    generateCommandContainer;

// Check if "secret.key" exists
let secret = "";
try {
    secret = fs.readFileSync(constant.SECRET_FILENAME).toString();
} catch (error) {
    if (error.code !== "ENOENT") {
        throw error;
    }
    console.error(
        "secret is NOT EXISTS,",
        `please generate one with "${generateCommand}".`,
        "\n",
    );
    throw new Error("secret.key not exists");
}

// Check length
if (secret.length < 2048) {
    console.error(
        "secret is NOT SAFE,",
        `please generate new one with "${generateCommand}".`,
        "\n",
    );
    throw new Error("secret.key not safe");
}

// Export as useFunction
exports.useSecret = () => secret;
