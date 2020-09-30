const express = require('express');
const router = express.Router();

const controller = require('../controllers/user.controller');

router.get('/', controller.index);

router.get('/edit', controller.edit);

router.get('/:username', controller.viewByUserName);

router.post('/edit', controller.postEdit);

module.exports = router;