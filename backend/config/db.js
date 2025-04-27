// backend/config/db.js

const mongoose = require('mongoose');

// ✅ MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/contact-manager');
        console.log("✅ MongoDB connected successfully");
    } catch (err) {
        console.error("❌ Error connecting to MongoDB:", err.message);
        process.exit(1); // Force exit on error
    }
};

module.exports = connectDB;
