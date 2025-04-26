// controllers/orderController.js
const Order = require('../models/OrderModel');
const Cart = require('../models/CartModel');

// Hardcoded values for development
const HARDCODED_USER_ID = "user123";

const orderController = {
  // Create a new order from cart
  createOrder: async (req, res) => {
    try {
      const userId = HARDCODED_USER_ID;
      const { 
        paymentMethod, 
        deliveryAddress, 
        customerPhone, 
        customerEmail,
        deliveryTime 
      } = req.body;
      
      // Validate required fields
      if (!paymentMethod || !deliveryAddress) {
        return res.status(400).json({
          success: false,
          message: "Payment method and delivery address are required"
        });
      }
      
      // Find user's cart
      const cart = await Cart.findOne({ userId });
      
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot create order: cart is empty"
        });
      }
      
      // Create new order from cart data
      const newOrder = new Order({
        userId,
        restaurantId: cart.restaurantId,
        restaurantName: cart.restaurantName,
        items: cart.items,
        subtotal: cart.subtotal,
        tax: cart.tax,
        deliveryFee: cart.deliveryFee,
        total: cart.total,
        paymentMethod,
        deliveryAddress,
        customerPhone,
        customerEmail,
        deliveryTime: deliveryTime || new Date(Date.now() + 45 * 60000) 
      });
      
      // Recalculate totals to ensure consistency
      newOrder.calculateTotals();
      
      // Save the order
      await newOrder.save();
      
      // Clear the cart after successful order creation
      cart.items = [];
      cart.restaurantId = null;
      cart.restaurantName = "";
      cart.subtotal = 0;
      cart.tax = 0;
      cart.deliveryFee = 0;
      cart.total = 0;
      await cart.save();
      
      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: newOrder
      });
      
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create order",
        error: error.message
      });
    }
  },
  
  // Get all orders for a user
  getUserOrders: async (req, res) => {
    try {
      const userId = HARDCODED_USER_ID;
      
      // Pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      // Find orders for this user with pagination
      const orders = await Order.find({ userId })
        .sort({ createdAt: -1 }) // Latest first
        .skip(skip)
        .limit(limit);
      
      // Get total count for pagination
      const totalOrders = await Order.countDocuments({ userId });
      
      res.status(200).json({
        success: true,
        data: {
          orders,
          pagination: {
            total: totalOrders,
            page,
            limit,
            pages: Math.ceil(totalOrders / limit)
          }
        }
      });
      
    } catch (error) {
      console.error("Get user orders error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve orders",
        error: error.message
      });
    }
  },
  
  // Get a specific order by ID
  getOrderById: async (req, res) => {
    try {
      const userId = HARDCODED_USER_ID;
      const { orderId } = req.params;
      
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required"
        });
      }
      
      // Find the specific order
      const order = await Order.findOne({
        _id: orderId,
        userId // Ensure user can only access their own orders
      });
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }
      
      res.status(200).json({
        success: true,
        data: order
      });
      
    } catch (error) {
      console.error("Get order by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve order",
        error: error.message
      });
    }
  },
  
  // Cancel an order
  cancelOrder: async (req, res) => {
    try {
      const userId = HARDCODED_USER_ID;
      const { orderId } = req.params;
      
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required"
        });
      }
      
      // Find the order
      const order = await Order.findOne({
        _id: orderId,
        userId
      });
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }
      
      // Check if the order can be cancelled
      const allowedStatuses = ['pending', 'confirmed'];
      if (!allowedStatuses.includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel order with status "${order.status}"`
        });
      }
      
      // Update order status
      order.status = 'cancelled';
      
      // If payment was already made, set to refunded
      if (order.paymentStatus === 'paid') {
        order.paymentStatus = 'refunded';
      }
      
      await order.save();
      
      res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
        data: order
      });
      
    } catch (error) {
      console.error("Cancel order error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to cancel order",
        error: error.message
      });
    }
  },
  
  // Update order status (for admin or restaurant)
  updateOrderStatus: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      
      // In a real app, you'd check user roles/permissions here
      
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required"
        });
      }
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required"
        });
      }
      
      // Validate status
      const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status"
        });
      }
      
      // Find and update order
      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }
      
      // Update status
      order.status = status;
      
      // If status is delivered, update payment status if needed
      if (status === 'delivered' && order.paymentMethod === 'cash') {
        order.paymentStatus = 'paid';
      }
      
      await order.save();
      
      res.status(200).json({
        success: true,
        message: "Order status updated",
        data: order
      });
      
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update order status",
        error: error.message
      });
    }
  },
  
  // Get orders for a specific restaurant (for restaurant dashboard)
  getRestaurantOrders: async (req, res) => {
    try {
      const { restaurantId } = req.params;
      
      // In a real app, you'd verify the restaurant user has permission to access these orders
      
      if (!restaurantId) {
        return res.status(400).json({
          success: false,
          message: "Restaurant ID is required"
        });
      }
      
      // Pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      // Filter parameters
      const status = req.query.status; // Optional status filter
      
      // Build query
      const query = { restaurantId };
      if (status) {
        query.status = status;
      }
      
      // Find orders for this restaurant with pagination
      const orders = await Order.find(query)
        .sort({ createdAt: -1 }) // Latest first
        .skip(skip)
        .limit(limit);
      
      // Get total count for pagination
      const totalOrders = await Order.countDocuments(query);
      
      res.status(200).json({
        success: true,
        data: {
          orders,
          pagination: {
            total: totalOrders,
            page,
            limit,
            pages: Math.ceil(totalOrders / limit)
          }
        }
      });
      
    } catch (error) {
      console.error("Get restaurant orders error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve restaurant orders",
        error: error.message
      });
    }
  }
};

module.exports = orderController;