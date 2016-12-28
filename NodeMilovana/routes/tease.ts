/*
 * GET tease page.
 */
import express = require('express');

const router = express.Router();

router.get('/', (req: express.Request, res: express.Response) => {
    var skin = "default";
    switch (req.query.skin) {
        case "plain":
            skin = "plain";
            break;
    }
    skin = `/stylesheets/tease.${skin}.min.css`;
    res.render('tease', { title: 'YAMiloTV - Web tease', skin: skin });
});

export default router;