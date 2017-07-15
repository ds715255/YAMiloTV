"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var request = require("request");
var router = express.Router();
router.get('/', function (req, res) {
    var r = request.head("https://milovana.com/media/get.php?folder=" + req.query.folder + "&name=" + req.query.id, function (error, response, body) {
        var loc = response.request.uri.href;
        if (error) {
        }
        else {
            res.send(loc);
        }
    });
});
exports.default = router;
//# sourceMappingURL=medialocation.js.map