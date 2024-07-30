const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const cartController = require('../controllers/cart.controller');

router.post('/', authController.authenticate, cartController.addItemToCart);
router.get('/', authController.authenticate, cartController.getCart);
router.delete('/', authController.authenticate, cartController.emptyCart);
router.delete('/:bookId', authController.authenticate, cartController.deleteCartItem);
router.put('/:bookId', authController.authenticate, cartController.updateCartItemQty);

router.get('/qty', authController.authenticate, cartController.getCartQty);

module.exports = router;
