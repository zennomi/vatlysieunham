const express = require('express');
const router = express.Router();

const controller = require('../controllers/lesson.controller');

router.get('/top-dates', controller.getTopDates);

module.exports = router;