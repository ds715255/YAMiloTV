/*
 * GET meta info
 */
import express = require('express');
import request = require('request');
const router = express.Router();

router.get('/', (req: express.Request, res: express.Response) => {
    var r = request.head("https://milovana.com/media/get.php?folder="+req.query.folder+"&name=" + req.query.id,
        (error, response, body) => {
            var loc=(response as any).request.uri.href;
            if (error) {

            } else {
                res.send(loc);
            }
        });

    //res.send("respond with a resource");
});

export default router;