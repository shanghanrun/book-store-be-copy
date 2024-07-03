const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');

router.post('/', userController.createUser); //register
router.get('/me', authController.authenticate, userController.getUser);

// admin user만
router.get('/admin', authController.authenticate, authController.checkAdminPermission, userController.getAllAdmin);

// all users
router.get('/all', authController.authenticate, authController.checkAdminPermission, userController.getAllUsers);

// admin에서 user level 업데이트
router.put('/:id', authController.authenticate, authController.checkAdminPermission, userController.updateLevel);

// mypage -password confirm
router.post('/confirmPassword', authController.authenticate, userController.myPageConfirmPassword);

// mypage -change user info
router.put('/myInfo/:id', authController.authenticate, userController.changeUserInfo);

// mypage -delete user
router.post('/delete/:id', authController.authenticate, userController.deleteUser);

module.exports = router;
