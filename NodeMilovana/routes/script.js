"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const request = require("request");
const router = express.Router();
router.get('/', (req, res) => {
    request.get("https://milovana.com/webteases/getscript.php?id=" + req.query.id, (error, response, body) => {
        if (error) {
        }
        else {
            res.send(body);
        }
    });
});
exports.default = router;
//# sourceMappingURL=script.js.map