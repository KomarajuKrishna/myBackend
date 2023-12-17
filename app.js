const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

// const userRoutes = require('./routes/userRoutes')
const api = require('./routes/userRoutes')
const business = require('./routes/Createbusiness')

const app = express();
app.use(bodyParser.json());
app.use(cors());

const port = 3000;

// MongoDB connection URL
const dbUrl = "mongodb+srv://tarakeshkostu:tarakeshkostu@cluster0.oklqzax.mongodb.net/?retryWrites=true&w=majority";

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

app.use('/', api);
app.use('/', business);