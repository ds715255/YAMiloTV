/*
 * Send vote.
 */
import express = require('express');
import request = require('request');
const router = express.Router();

router.get('/', (req: express.Request, res: express.Response) => {
    request.post({
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        url: 'https://milovana.com/webteases/voteblack.php?id=' + req.query.id,
        body: "vote="+req.query.vote
    }, function (error, response, body) {
        if (error) {
            res.statusCode = response.statusCode;
            res.send();
        } else {
            res.send();
        }
    });
});

export default router;