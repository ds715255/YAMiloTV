"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path = require("path");
const index_1 = require("./routes/index");
const tease_1 = require("./routes/tease");
const script_1 = require("./routes/script");
const meta_1 = require("./routes/meta");
const medialocation_1 = require("./routes/medialocation");
const vote_1 = require("./routes/vote");
var app = express();
if (process.argv.indexOf("debug") != -1) {
    app.set('debug', true);
}
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index_1.default);
app.use('/tease', tease_1.default);
app.use('/script', script_1.default);
app.use('/meta', meta_1.default);
app.use('/medialocation', medialocation_1.default);
app.use('/vote', vote_1.default);
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err['status'] = 404;
    next(err);
});
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err['status'] || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
module.exports = app;
//# sourceMappingURL=app.js.map