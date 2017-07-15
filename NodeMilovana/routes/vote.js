"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var request = require("request");
var router = express.Router();
router.get('/', function (req, res) {
    request.post({
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        url: 'https://milovana.com/webteases/voteblack.php?id=' + req.query.id,
        body: "vote=" + req.query.vote
    }, function (error, response, body) {
        if (error) {
            res.statusCode = response.statusCode;
            res.send();
        }
        else {
            res.send();
        }
    });
});
exports.default = router;
//# sourceMappingURL=vote.js.map