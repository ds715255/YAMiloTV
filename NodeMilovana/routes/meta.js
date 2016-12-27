"use strict";
const express = require("express");
const request = require("request");
const router = express.Router();
router.get('/', (req, res) => {
    request.get("https://milovana.com/webteases/showflash.php?id=" + req.query.id, (error, response, body) => {
        const regex = /<div id="headerbar">\s*<div class="title">(.*?) by <a href="webteases\/#author=(\d+)" [^>]*>(.*?)<\/a><\/div>/gm;
        let m;
        var authorId;
        var title;
        var author;
        while ((m = regex.exec(body)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            m.forEach((match, groupIndex) => {
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
        request.get("https://milovana.com/webteases/getscript.php?metainfo=1&id=" + req.query.id, (error, response, body) => {
            if (error) {
            }
            else {
                res.send(authorId + "\n" + title + "\n" + author + "\n" + body);
            }
        });
    });
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
//# sourceMappingURL=meta.js.map