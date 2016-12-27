"use strict";
const express = require("express");
const router = express.Router();
router.get('/', (req, res) => {
    res.render('tease', { title: 'YAMiloTV - Web tease' });
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
//# sourceMappingURL=tease.js.map