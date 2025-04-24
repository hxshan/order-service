const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const orderRoutes = require('./routes/CartRoutes');
require("dotenv").config();

const app = express();

const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to mongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB :", err));

app.use('/api/orders', orderRoutes);
app.use('/api/cart', orderRoutes);


if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log("Server listening on port:", port);
  });
}

module.exports = app;
