"use strict";
const express = require("express");
const router = express.Router();
router.get('/', (req, res) => {
    res.render('index', { title: 'YAMiloTV' });
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
//# sourceMappingURL=index.js.map