const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const interceptor = require('../common/exception/http-exception.filter');
const service = require('../service/auth.service');

router.post('/login', authController.loginWithEmail);
router.post('/google', authController.loginWithGoogle);

router.get('/kakao', authController.loginWithKakao, service.loginWithKakao, interceptor);
router.get('/github', authController.loginWithGithub, service.loginWithGithub, interceptor);

module.exports = router;
