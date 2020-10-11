const express = require('express');
const router = express.Router();

const controller = require('../controllers/record.controller');

router.get('/', controller.index);

router.get('/:id/view', controller.viewById);

router.get('/:id/edit', controller.editById);

router.get('/:id/delete/', controller.deleteById);

router.get('/create', controller.create);

router.get('/:id', controller.viewById);

router.post('/create', controller.postCreate);

router.post('/edit', controller.postEdit);

router.post('/delete', controller.postDelete);

module.exports = router;