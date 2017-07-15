/*
 * GET meta info
 */
import express = require('express');
import request = require('request');
const router = express.Router();

router.get('/', (req: express.Request, res: express.Response) => {

    request.get("https://milovana.com/webteases/showflash.php?id=" + req.query.id,
        (error, response, body) => {
            const regex = /<div id="headerbar">\s*<div class="title">(.*?) by <a href="webteases\/#author=(\d+)" [^>]*>(.*?)<\/a><\/div>/gm;
            let m;
            var authorId;
            var title;
            var author;
            var thumbnail;

            while ((m = regex.exec(body)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex.lastIndex) {
                    regex.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
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

            request.get("https://milovana.com/webteases/list.php?author=" + author + "&pp=50",
                (error, response, body) => {
                    if (!error) {
                        var tnregex = new RegExp("id=" + req.query.id + "\"><img src=\"(.+?)\"", "gm");
                        while ((m = tnregex.exec(body)) !== null) {
                            // This is necessary to avoid infinite loops with zero-width matches
                            if (m.index === tnregex.lastIndex) {
                                tnregex.lastIndex++;
                            }

                            // The result can be accessed through the `m`-variable.
                            m.forEach((match, groupIndex) => {
                                switch (groupIndex) {
                                case 1:
                                    thumbnail = match;
                                    break;
                                }
                            });
                        }
                    }

                    request.get("https://milovana.com/webteases/getscript.php?metainfo=1&id=" + req.query.id,
                        (error, response, body) => {
                            if (error) {

                            } else {
                                res.send(authorId + "\n" + title + "\n" + author + "\n" + thumbnail + "\n" + body);
                            }
                        });
                });
        });

    //res.send("respond with a resource");
});

export default router;