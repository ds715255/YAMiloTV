"use strict";
const express = require("express");
const request = require("request");
const router = express.Router();
router.get('/', (req, res) => {
    var r = request.head("https://milovana.com/media/get.php?folder=" + req.query.folder + "&name=" + req.query.id, (error, response, body) => {
        var loc = response.request.uri.href;
        if (error) {
        }
        else {
            res.send(loc);
        }
    });
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
//# sourceMappingURL=medialocation.js.map