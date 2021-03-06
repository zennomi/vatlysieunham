const express = require('express');
const router = express.Router();

const controller = require('../controllers/student.controller');
const validate = require('../validate/student.validate')

router.get('/', controller.index);

router.get('/search', controller.search);

router.get('/create', controller.create);

router.get('/:id', controller.getById);

router.get('/edit/:id', controller.editById);

router.get('/delete/:id', controller.deleteById);

router.post('/create', validate.postCreate, controller.postCreate);

router.post('/edit', controller.postEdit);

router.post('/delete', controller.postDelete);

module.exports = router;