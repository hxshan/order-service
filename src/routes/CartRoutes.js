// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/CartController');


router.get('/', cartController.getCart);


router.post('/', cartController.addToCart);


router.delete('/:index', cartController.removeFromCart);


router.patch('/:index', cartController.updateQuantity);


router.delete('/', cartController.clearCart);

module.exports = router;