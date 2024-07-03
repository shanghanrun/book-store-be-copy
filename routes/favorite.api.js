const express = require('express');
const authController = require('../controllers/auth.controller');
const favController = require('../controllers/fav.controller');

const router = express.Router();

router.get('/', authController.authenticate, favController.getFavorite);
router.put('/:id', authController.authenticate, favController.addFavorite);
router.delete('/:id', authController.authenticate, favController.deleteFavorite);

module.exports = router;
