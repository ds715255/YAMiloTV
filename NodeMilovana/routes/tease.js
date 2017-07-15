"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
router.get('/', (req, res) => {
    var skin = "default";
    switch (req.query.skin) {
        case "plain":
            skin = "plain";
            break;
    }
    skin = `/stylesheets/tease.${skin}.min.css`;
    res.render('tease', { title: 'YAMiloTV - Web tease', skin: skin, debug: req.app.get('debug') });
});
exports.default = router;
//# sourceMappingURL=tease.js.map