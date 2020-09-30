const express = require('express');
const router = express.Router();

const controller = require('../controllers/class.controller');

router.get('/', controller.index);

router.get('/:name', controller.getByName);

module.exports = router;