"use strict";

// Load configs from .env
require("dotenv").config();

// Import StatusCodes
const {StatusCodes} = require("http-status-codes");

// Import modules
const constant = require("./src/init/const");
const ctx = {
    now: () => Math.floor(new Date().getTime() / 1000),
    cache: require("./src/init/cache"),
    database: require("./src/init/database"),
    jwt_secret: require("./src/init/jwt_secret"),
};
const util = {
    ip_address: require("./src/utils/ip_address"),
};

// Initialize application
const app = require("./src/init/express")(ctx);

// Redirect / to WEBSITE_URL
app.get("/", (req, res) => {
    res.redirect(StatusCodes.MOVED_PERMANENTLY, process.env.WEBSITE_URL);
});

// The handler for robots.txt (deny all friendly robots)
app.get(
    "/robots.txt",
    (_, res) => res.type("txt").send("User-agent: *\nDisallow: /"),
);

// Example to show the visitor's IP with util.ip_address
app.get("/ip", (req, res) => {
    res.send({ip_address: util.ip_address(req)});
});

// Map routes
require("./src/controllers/index")(ctx, app);

// Show status message
(() => {
    const nodeEnv = process.env.NODE_ENV;
    const runtimeEnv = process.env.RUNTIME_ENV || "native";
    console.info(
        constant.APP_NAME,
        `(runtime: ${nodeEnv}, ${runtimeEnv})`,
        "\n====",
    );
})();
// Mount application and execute it
require("./src/execute")(app, ({type, hostname, port}) => {
    const protocol = type === "general" ? "http" : "https";
    console.info(`Protocol "${protocol}" is listening at`);
    console.info(`${protocol}://${hostname}:${port}`);
});
