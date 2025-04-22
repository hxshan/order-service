const Order = require('../models/Order');

const errorEnum = require("../utils/error_utils")

// Create order
const createOrder = async(req , res) => {
  try{

    const order = new Order(req.body);
    await order.save()
    res.status(200).json({ order })

  } catch (err) {
    res.status(500).json({ message: errorEnum.SERVER_ERROR})
  }
}


module.exports = {
  createOrder
}