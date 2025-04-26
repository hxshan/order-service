// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');



router.post('/', orderController.createOrder);

router.get('/', orderController.getUserOrders);

router.get('/:orderId', orderController.getOrderById);

router.delete('/:orderId', orderController.cancelOrder);

router.patch('/status/:orderId', orderController.updateOrderStatus);

router.get('/restaurant/:restaurantId', orderController.getRestaurantOrders);



module.exports = router;