const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { creatContact, getContactsByUser, getAllContacts } = require('../controllers/contact.controller');

// 1:1 문의 DB에 저장, 수정, 삭제
router.post('/', authController.authenticate, creatContact);
router.get('/', authController.authenticate, authController.checkAdminPermission, getAllContacts);
router.get('/user', authController.authenticate, getContactsByUser);

module.exports = router;
