const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const userRoutes = require('./routes/userRoutes')
const restaurantRoutes = require('./routes/restaurantRoutes')
const business = require('./routes/Createbusiness')
const reelsRouter = require('./routes/reelsRouter')
const imageupload = require('./routes/imageupload')
const multipleimageupload = require('./routes/Multipleimageupload')

const app = express();
app.use(bodyParser.json());
app.use(cors());

const port = 3000;

// MongoDB connection URL
const dbUrl = "mongodb+srv://KomarajuBablu:Honeybablu1772@cluster0.zktypoh.mongodb.net/VIPMEAPP?retryWrites=true&w=majority";
// const dbUrl =
  // "mongodb+srv://KomarajuBablu:Honeybablu1772@cluster0.zktypoh.mongodb.net/VIPMEAPP?retryWrites=true&w=majority";
// Connecting to MongoDB
const connectToDatabase = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

connectToDatabase();

app.listen(port, () => {
  console.log(`Server is Running at: http://localhost:${port}`);
});

app.use('/', userRoutes);
app.use('/', restaurantRoutes);
app.use('/', reelsRouter)
app.use('/', business);
app.use('/', imageupload);
app.use('/', multipleimageupload);