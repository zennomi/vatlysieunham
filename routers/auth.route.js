const express = require('express');
var router = express.Router();

const controller = require('../controllers/auth.controller');

router.get('/login', controller.login);

router.get('/logout', controller.logout);

router.post('/login', controller.postLogin);

module.exports = router;