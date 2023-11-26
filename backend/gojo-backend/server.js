const express = require("express");
const mongoose = require("mongoose");
const dotenv = require('dotenv').config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const authenticateJWT = require("./middleware/authMiddleware");
const handleErrors = require("./middleware/errorMiddleware");
const PORT = 3001;
import sanitizeHtml from 'sanitize-html';

const sanitizedInput = sanitizeHtml(userInput);



const bcrypt = require('bcrypt');

const cors = require('cors');

const helmet = require('helmet');

// Hashing a password
const saltRounds = 10;
const hashedPassword = await bcrypt.hash('user_password', saltRounds);

const token = jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '1h' });

const app = express();
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/your-database-name", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Register a new user
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.json({ message: "Registration successful" });
  } catch (error) {
    next(error); // Pass the error to the next middleware (error handling middleware)
  }
});

// Login endpoint
app.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Check if the provided password matches the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate a JWT token for the authenticated user
    const token = jwt.sign({ userId: user._id }, "your-secret-key", {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token });
  } catch (error) {
    next(error); // Pass the error to the next middleware (error handling middleware)
  }
});

// Protected route endpoint with JWT middleware
app.get("/protected-route", authenticateJWT, (req, res) => {
  // Extracted user ID from the middleware
  const userId = req.user.userId;

  // Fetch additional data or perform actions based on the user ID
  // For simplicity, let's just send a message back
  res.json({
    message: `Hello, user with ID ${userId}! This is a protected route.`,
  });
});

// Error handling middleware
app.use(handleErrors);
// Use helmet middleware
app.use(helmet());
// Use cors middleware
app.use(cors());

// Product schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
});

// Product listing endpoint
app.get("/products", async (req, res) => {
  // Fetch all products from the database
  const products = await Product.find();
  res.json(products);
});

// Image upload endpoint (using a hypothetical library like multer)

app.post("/upload", upload.single("image"), (req, res) => {
  // Handle the uploaded image, save the file path to the database, and associate it with a product
  const imagePath = req.file.path;
  res.json({ message: "Image uploaded successfully", imagePath });
});

// Enable CORS for all routes
app.use(cors());

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Add these routes after the existing ones in `server.js`

// Example landing page route
app.get("/", (req, res) => {
  res.send("Welcome to the e-commerce site!");
});

// Example route to serve the React app (make sure to build the React app first)
app.use(express.static(path.join(__dirname, "client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});

// Create a new product
app.post("/products", async (req, res) => {
  const { name, description, price } = req.body;

  const newProduct = new Product({ name, description, price });
  await newProduct.save();

  res.json({ message: "Product created successfully", product: newProduct });
});

// Get all products
app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Get a single product by ID
app.get("/products/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);
    res.json(product);
  } catch (error) {
    res.status(404).json({ message: "Product not found" });
  }
});

// Update a product by ID
app.put("/products/:id", async (req, res) => {
  const productId = req.params.id;
  const { name, description, price } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { name, description, price },
      { new: true }
    );
    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(404).json({ message: "Product not found" });
  }
});

// Delete a product by ID
app.delete("/products/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);
    res.json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    res.status(404).json({ message: "Product not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
