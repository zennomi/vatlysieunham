const express = require('express');
const router = express.Router();

const controller = require('../controllers/student.controller');

router.get('/search', controller.search);

router.get('/:id', controller.getById);

module.exports = router;