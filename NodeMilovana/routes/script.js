"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var request = require("request");
var router = express.Router();
router.get('/', function (req, res) {
    request.get("https://milovana.com/webteases/getscript.php?id=" + req.query.id, function (error, response, body) {
        if (error) {
        }
        else {
            res.send(body);
        }
    });
});
exports.default = router;
//# sourceMappingURL=script.js.map