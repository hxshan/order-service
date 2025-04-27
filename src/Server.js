const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cartRoutes = require('./routes/CartRoutes');
const orderRoutes = require('./routes/OrderRoutes');
require("dotenv").config();

const app = express();

const port = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'DELETE', 'PATCH'],
  credentials: true, 
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to mongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB :", err));

app.use('/cart', cartRoutes);
app.use('/', orderRoutes);


if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log("Server listening on port:", port);
  });
}

module.exports = app;
