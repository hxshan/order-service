const mongoose = require("mongoose")

const orderItemSchema = new mongoose.Schema({
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'MenuItem'
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true, 
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    customizations: {
      type: [String],
      default: []
    }
  });

  module.exports = orderItemSchema;