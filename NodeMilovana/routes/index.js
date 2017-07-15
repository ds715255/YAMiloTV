"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var router = express.Router();
router.get('/', function (req, res) {
    res.render('index', { title: 'YAMiloTV', debug: req.app.get('debug') });
});
exports.default = router;
//# sourceMappingURL=index.js.map