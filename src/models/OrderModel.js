const mongoose = require("mongoose");
const orderItemSchema = require("./OrderItem"); 

const orderSchema = new mongoose.Schema({
  userId: {
    type: String, 
    required: true
  },
  restaurantId: {
    type: String,
    required: true
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'cash'],
    required: true
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    instructions: String
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  estimatedDeliveryTime: {
    type: Date
  },
  actualDeliveryTime: {
    type: Date
  },
  specialInstructions: {
    type: String
  }
}, { timestamps: true });


// orderSchema.methods.calculateTotal = function() {
//   let total = 0;
//   this.items.forEach(item => {
//     total += item.price * item.quantity;
//   });
//   return total + this.deliveryFee;
// };


// orderSchema.pre('save', async function(next) {
//   if (this.isModified('items') || this.isModified('deliveryFee') || this.isNew) {
//     this.totalAmount = this.calculateTotal();
//   }
//   next();
// });

module.exports =  mongoose.model("Order",  orderSchema);
