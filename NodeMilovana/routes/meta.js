"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var request = require("request");
var router = express.Router();
router.get('/', function (req, res) {
    request.get("https://milovana.com/webteases/showflash.php?id=" + req.query.id, function (error, response, body) {
        var regex = /<div id="headerbar">\s*<div class="title">(.*?) by <a href="webteases\/#author=(\d+)" [^>]*>(.*?)<\/a><\/div>/gm;
        var m;
        var authorId;
        var title;
        var author;
        var thumbnail;
        while ((m = regex.exec(body)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            m.forEach(function (match, groupIndex) {
                switch (groupIndex) {
                    case 1:
                        title = match;
                        break;
                    case 2:
                        authorId = match;
                        break;
                    case 3:
                        author = match;
                        break;
                }
            });
        }
        request.get("https://milovana.com/webteases/list.php?author=" + author + "&pp=50", function (error, response, body) {
            if (!error) {
                var tnregex = new RegExp("id=" + req.query.id + "\"><img src=\"(.+?)\"", "gm");
                while ((m = tnregex.exec(body)) !== null) {
                    if (m.index === tnregex.lastIndex) {
                        tnregex.lastIndex++;
                    }
                    m.forEach(function (match, groupIndex) {
                        switch (groupIndex) {
                            case 1:
                                thumbnail = match;
                                break;
                        }
                    });
                }
            }
            request.get("https://milovana.com/webteases/getscript.php?metainfo=1&id=" + req.query.id, function (error, response, body) {
                if (error) {
                }
                else {
                    res.send(authorId + "\n" + title + "\n" + author + "\n" + thumbnail + "\n" + body);
                }
            });
        });
    });
});
exports.default = router;
//# sourceMappingURL=meta.js.map