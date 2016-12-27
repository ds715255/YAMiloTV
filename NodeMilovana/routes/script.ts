/*
 * GET script file.
 */
import express = require('express');
import request = require('request');
const router = express.Router();

router.get('/', (req: express.Request, res: express.Response) => {
    request.get("https://milovana.com/webteases/getscript.php?id=" + req.query.id,
        (error, response, body) => {
            if (error) {
                
            } else {                                
                res.send(body);
            }
        });       
});

export default router;