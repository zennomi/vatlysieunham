const express = require('express');
const router = express.Router();

var controller = require('../controllers/homework.controller');

router.get('/', controller.index);

router.get('/view/:id', controller.viewById);

router.get('/edit/:id', controller.editById);

router.get('/delete/:id', controller.deleteById);

router.get('/create', controller.create);

router.post('/create', controller.postCreate);

router.post('/delete', controller.postDelete);

module.exports = router;