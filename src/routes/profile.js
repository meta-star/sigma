"use strict";

const {getMust} = require("../config");

const {StatusCodes} = require("http-status-codes");
const {useApp, express} = require("../init/express");

const {useDatabase} = require("../init/database");
const {useCache} = require("../init/cache");

const utilMailSender = require("../utils/mail_sender");
const utilSigmaToken = require("../utils/sigma_token");
const utilCodeSession = require("../utils/code_session");
const utilVisitor = require("../utils/visitor");
const utilUser = require("../utils/user");

const schemaUser = require("../schemas/user");

const middlewareAccess = require("../middleware/access");
const middlewareInspector = require("../middleware/inspector");
const middlewareValidator = require("express-validator");
const middlewareRestrictor = require("../middleware/restrictor");

// Create router
const {Router: newRouter} = express;
const router = newRouter();

router.use(express.urlencoded({extended: true}));

const database = useDatabase();
const cache = useCache();

router.get("/",
    middlewareAccess(null),
    async (req, res) => {
        res.send({profile: req.auth.metadata.user});
    },
);

router.put("/",
    middlewareAccess(null),
    async (req, res) => {
        // Check user exists by the ID
        const User = database.model("User", schemaUser);
        const user = await User.findById(req.auth.id).exec();
        if (!user) {
            res.sendStatus(StatusCodes.NOT_FOUND);
            return;
        }

        // Handle updates
        user.nickname =
            req?.body?.nickname ||
            req.auth.metadata.user.nickname;

        // Update values
        const metadata = await utilUser.saveData(user);
        const token = utilSigmaToken.
            issue(metadata);

        // Send response
        res
            .header("Sigma-Issue", token)
            .sendStatus(StatusCodes.CREATED);
    },
);

router.put("/email",
    middlewareAccess(null),
    middlewareValidator.body("email").isEmail().notEmpty(),
    middlewareInspector,
    middlewareRestrictor(10, 60, false),
    async (req, res) => {
        // Handle code and metadata
        const metadata = {
            _id: req.auth.id,
            email: req.body.email,
        };
        const {code, sessionId} = utilCodeSession.createOne(metadata, 8, 1800);

        // Handle conflict
        const User = database.model("User", schemaUser);
        if (await User.findOne({email: req.body.email}).exec()) {
            res.sendStatus(StatusCodes.CONFLICT);
            return;
        }

        // Handle mail
        try {
            await utilMailSender("update_email", {
                to: req.body.email,
                website: getMust("SIGMA_AUDIENCE_URL"),
                ip_address: utilVisitor.getIPAddress(req),
                code,
            });
            if (getMust("NODE_ENV") === "testing") {
                cache.set("_testing_code", code);
            }
        } catch (e) {
            console.error(e);
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
            return;
        }

        // Send response
        res.send({
            session_type: "update_email",
            session_id: sessionId,
        });
    },
);

router.post("/email/verify",
    middlewareAccess(null),
    middlewareValidator.body("code").isNumeric().notEmpty(),
    middlewareValidator.body("code").isLength({min: 8, max: 8}).notEmpty(),
    middlewareValidator.body("session_id").isString().notEmpty(),
    middlewareInspector,
    middlewareRestrictor(10, 60, false),
    async (req, res) => {
        // Get metadata back by the code
        const metadata = utilCodeSession.
            getOne(req.body.session_id, req.body.code);

        if (metadata === null) {
            // Check metadata
            res.sendStatus(StatusCodes.UNAUTHORIZED);
            return;
        } else {
            // Remove session
            utilCodeSession.
                deleteOne(req.body.session_id, req.body.code);
        }

        // Check user exists by the ID
        const User = database.model("User", schemaUser);
        const user = await User.findById(req.auth.id).exec();
        if (!user) {
            res.sendStatus(StatusCodes.NOT_FOUND);
            return;
        }

        // Update values
        user.email = metadata.data.email;
        const userData = utilUser.saveData(user);

        // Generate token
        const token = utilSigmaToken.issue(userData);

        // Send response
        res
            .header("Sigma-Issue", token)
            .sendStatus(StatusCodes.CREATED);
    },
);

// Export routes mapper (function)
module.exports = () => {
    // Use application
    const app = useApp();

    // Mount the router
    app.use("/profile", router);
};
