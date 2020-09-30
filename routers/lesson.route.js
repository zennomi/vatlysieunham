const express = require('express');
const router = express.Router();

const controller = require('../controllers/lesson.controller');

const validate = require('../validate/lesson.validate');
const Lesson = require('../models/lesson.model');
const Student = require('../models/student.model');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', controller.index);

router.get('/create', controller.create);

router.get('/register', controller.register);

router.get('/registers', controller.viewRegisters);

router.get('/schedule', controller.schedule);

router.get('/check', controller.check);

router.get('/analyse', authMiddleware.authRequire, controller.analyse);

router.get('/:date', controller.viewByDate);

router.get('/view/:id', controller.viewById);

router.get('/edit/:id', controller.editById);

router.get('/delete/:id', controller.deleteById);

router.post('/create', validate.postCreate, controller.postCreate);

router.post('/register', controller.postRegister);

router.post('/edit', validate.postCreate, controller.postEdit);

router.post('/delete', controller.postDelete);

module.exports = router;