const express = require('express');
const router = express.Router();

const controller = require('../controllers/class.controller');

router.get('/', controller.index);

router.get('/:name', controller.getByName);

router.get('/:name/data', controller.getDataStudents);

router.get('/:name/edit', controller.editByName);

router.post('/:id/edit', controller.postEditById);

module.exports = router;