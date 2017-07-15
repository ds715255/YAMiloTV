"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require("path");
var index_1 = require("./routes/index");
var tease_1 = require("./routes/tease");
var script_1 = require("./routes/script");
var meta_1 = require("./routes/meta");
var medialocation_1 = require("./routes/medialocation");
var vote_1 = require("./routes/vote");
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
    app.use(function (err, req, res, next) {
        res.status(err['status'] || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
module.exports = app;
//# sourceMappingURL=app.js.map