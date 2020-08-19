var express = require('express');
var router = express.Router();

var controller = require('../controllers/class.controller');

router.get('/', controller.index);

router.get('/:name', controller.getByName);

module.exports = router;