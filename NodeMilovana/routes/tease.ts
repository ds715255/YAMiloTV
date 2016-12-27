/*
 * GET tease page.
 */
import express = require('express');

const router = express.Router();

router.get('/', (req: express.Request, res: express.Response) => {
    res.render('tease', { title: 'YAMiloTV - Web tease' });
});

export default router;