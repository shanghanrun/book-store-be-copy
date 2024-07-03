const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const orderController = require('../controllers/order.controller');

router.post('/', authController.authenticate, orderController.createOrder);
router.get('/', authController.authenticate, orderController.getOrderList);
router.put('/:id', authController.authenticate, authController.checkAdminPermission, orderController.updateOrder); // 어드민 권한 추가
router.get('/me', authController.authenticate, orderController.getMyOrder);

router.post('/request', authController.authenticate, orderController.requestOrder);
router.get('/request', authController.authenticate, orderController.getRequestList);
router.get('/request/me', authController.authenticate, orderController.getMyRequest);
router.put(
  '/request/:id',
  authController.authenticate,
  authController.checkAdminPermission,
  orderController.updateRequest,
); // 어드민 권한 추가

module.exports = router;
