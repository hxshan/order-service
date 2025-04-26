// controllers/cartController.js
const Cart = require('../models/CartModel');

// Hardcoded values for development
const HARDCODED_USER_ID = "user13";
const DEFAULT_RESTAURANT_ID = "rest456";
const DEFAULT_RESTAURANT_NAME = "Default Restaurant";

// Helper function to get or create a cart
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  
  if (!cart) {
    cart = new Cart({
      userId,
      items: [],
    });
  }
  
  return cart;
};

const cartController = {
  // Get cart
  getCart: async (req, res) => {
    try {
      // In a real app, you'd get userId from auth middleware
      const userId = HARDCODED_USER_ID;
      
      // Get restaurantId from query params or use default
      const restaurantId = req.query.restaurantId || null;
      
      let cart = await Cart.findOne({ userId });
      
      if (!cart) {
        return res.status(200).json({
          success: true,
          message: "No cart found",
          data: {
            items: [],
            restaurantId: null,
            restaurantName: "",
            subtotal: 0,
            tax: 0,
            deliveryFee: 0,
            total: 0
          }
        });
      }
      
      // If a specific restaurant is requested, filter the cart
      if (restaurantId && cart.restaurantId !== restaurantId) {
        return res.status(200).json({
          success: true,
          message: "No cart found for this restaurant",
          data: {
            items: [],
            restaurantId: null,
            restaurantName: "",
            subtotal: 0,
            tax: 0,
            deliveryFee: 0,
            total: 0
          }
        });
      }
      
      res.status(200).json({
        success: true,
        data: cart
      });
      
    } catch (error) {
      console.error("Get cart error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve cart",
        error: error.message
      });
    }
  },
  
  // Add item to cart
  addToCart: async (req, res) => {
    try {
      const userId = HARDCODED_USER_ID;
      const { item, restaurantId = DEFAULT_RESTAURANT_ID, restaurantName = DEFAULT_RESTAURANT_NAME } = req.body;
      
      if (!item) {
        return res.status(400).json({
          success: false,
          message: "Item details are required"
        });
      }
      
      let cart = await getOrCreateCart(userId);
      
      // Check if restaurant is different, clear cart if so
      if (cart.restaurantId && cart.restaurantId !== restaurantId) {
        cart.items = [];
        cart.restaurantId = restaurantId;
        cart.restaurantName = restaurantName;
      }
      
      // Check if the item already exists with same customizations
      const existingItemIndex = cart.items.findIndex(
        cartItem => 
          cartItem.id === item.id &&
          cartItem.size === item.size &&
          JSON.stringify(cartItem.addOns) === JSON.stringify(item.addOns)
      );
      
      if (existingItemIndex !== -1) {
        // If item exists, increment quantity
        cart.items[existingItemIndex].quantity += item.quantity || 1;
      } else {
        // Otherwise add new item
        cart.items.push(item);
      }
      
      // Set restaurant info if adding first item
      if (!cart.restaurantId) {
        cart.restaurantId = restaurantId;
        cart.restaurantName = restaurantName;
      }
      
      // Calculate totals
      cart.calculateTotals();
      
      await cart.save();
      
      res.status(200).json({
        success: true,
        message: "Item added to cart",
        data: cart
      });
      
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add item to cart",
        error: error.message
      });
    }
  },
  
  // Remove item from cart
  removeFromCart: async (req, res) => {
    try {
      const userId = HARDCODED_USER_ID;
      const { index } = req.params;
      
      if (index === undefined) {
        return res.status(400).json({
          success: false,
          message: "Item index is required"
        });
      }
      
      let cart = await getOrCreateCart(userId);
      
      if (!cart.items[index]) {
        return res.status(404).json({
          success: false,
          message: "Item not found in cart"
        });
      }
      
      // Remove the item at the specified index
      cart.items.splice(index, 1);
      
      // If cart is empty, reset restaurant info
      if (cart.items.length === 0) {
        cart.restaurantId = null;
        cart.restaurantName = "";
      }
      
      // Calculate new totals
      cart.calculateTotals();
      
      await cart.save();
      
      res.status(200).json({
        success: true,
        message: "Item removed from cart",
        data: cart
      });
      
    } catch (error) {
      console.error("Remove from cart error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove item from cart",
        error: error.message
      });
    }
  },
  
  // Update item quantity
  updateQuantity: async (req, res) => {
    try {
      const userId = HARDCODED_USER_ID;
      const { index } = req.params;
      const { quantity } = req.body;
      
      if (index === undefined) {
        return res.status(400).json({
          success: false,
          message: "Item index is required"
        });
      }
      
      if (quantity === undefined || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Valid quantity is required"
        });
      }
      
      let cart = await getOrCreateCart(userId);
      
      if (!cart.items[index]) {
        return res.status(404).json({
          success: false,
          message: "Item not found in cart"
        });
      }
      
      // Update quantity
      cart.items[index].quantity = quantity;
      
      // Calculate new totals
      cart.calculateTotals();
      
      await cart.save();
      
      res.status(200).json({
        success: true,
        message: "Item quantity updated",
        data: cart
      });
      
    } catch (error) {
      console.error("Update quantity error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update item quantity",
        error: error.message
      });
    }
  },
  
  // Clear cart
  clearCart: async (req, res) => {
    try {
      const userId = HARDCODED_USER_ID;
      
      let cart = await getOrCreateCart(userId);
      
      // Reset cart to empty state
      cart.items = [];
      cart.restaurantId = null;
      cart.restaurantName = "";
      cart.subtotal = 0;
      cart.tax = 0;
      cart.deliveryFee = 0;
      cart.total = 0;
      
      await cart.save();
      
      res.status(200).json({
        success: true,
        message: "Cart cleared",
        data: cart
      });
      
    } catch (error) {
      console.error("Clear cart error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to clear cart",
        error: error.message
      });
    }
  }
};

module.exports = cartController;