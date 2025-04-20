const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  restaurantId: { type: String, required: true },
  items: [
    {
      itemId: String,
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "preparing", "on the way", "delivered"],
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
