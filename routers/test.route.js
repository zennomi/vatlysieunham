const express = require('express');
const router = express.Router();

const controller = require('../controllers/test.controller');

router.get('/', controller.index);

router.get('/view/:id', controller.viewById);

router.get('/create', controller.create);

router.get('/edit/:id', controller.editById);

router.get('/delete/:id', controller.deleteById);

router.post('/edit', controller.postEdit);

router.post('/create', controller.postCreate);

router.post('/delete', controller.postDelete);

module.exports = router;