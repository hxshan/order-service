// models/Cart.js
const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  size: { type: String },
  sizePrice: { type: Number, default: 0 },
  addOns: [{ type: String }],
  addOnsPrices: [{ type: Number }],
  image: { type: String }
});

const CartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  restaurantId: { type: String },
  restaurantName: { type: String },
  items: [CartItemSchema],
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to update the 'updatedAt' field on save
CartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to calculate totals
CartSchema.methods.calculateTotals = function() {
  // Calculate subtotal
  this.subtotal = this.items.reduce((total, item) => {
    let itemPrice = item.price;
    
    // Add size price
    if (item.sizePrice) {
      itemPrice += item.sizePrice;
    }
    
    // Add addOns prices
    if (item.addOnsPrices && item.addOnsPrices.length) {
      itemPrice += item.addOnsPrices.reduce((sum, price) => sum + price, 0);
    }
    
    return total + (itemPrice * item.quantity);
  }, 0);
  
  // Calculate tax (10%)
  this.tax = Math.round(this.subtotal * 0.1);
  
  // Calculate delivery fee
  this.deliveryFee = this.subtotal > 0 ? 150 : 0;
  
  // Calculate total
  this.total = this.subtotal + this.tax + this.deliveryFee;
  
  return this;
};

module.exports = mongoose.model('Cart', CartSchema);