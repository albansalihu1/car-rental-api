import express from "express";
import { ObjectId } from "mongodb";
import { getDB } from "./rent.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());

function authenticateToken(req, res, next) {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
}

app.post("/cars", async (req, res) => {
    try {
        const db = getDB();
        if (!db) return res.status(500).json({ message: "Database not connected" });

        const { name, price_per_day, year, color, steering_type, number_of_seats } = req.body;

        if (!name || !price_per_day || !year || !color || !steering_type || !number_of_seats) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newRental = {
            name,
            price_per_day,
            year,
            color,
            steering_type,
            number_of_seats,
        };

        const result = await db.collection("cars").insertOne(newRental);
        res.status(201).json({ message: "Car added successfully", carId: result.insertedId });
    } catch (error) {
        console.error("Error inserting car:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/register", async (req, res) => {
    try {
        const db = getDB();
        if (!db) return res.status(500).json({ message: "Database not connected" });

        const { full_name, email, username, password } = req.body;

        // Check if all fields are provided
        if (!full_name || !email || !username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if username or email already exists
        const existingUser = await db.collection("users").findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            return res.status(400).json({ message: "Email or username already in use" });
        }

        // Hash password before storing
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = {
            full_name,
            email,
            username,
            password: hashedPassword,
        };

        const result = await db.collection("users").insertOne(newUser);
        res.status(201).json({ message: "User registered successfully", userId: result.insertedId });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// User Login Endpoint
app.post("/login", async (req, res) => {
    try {
        const db = getDB();
        if (!db) return res.status(500).json({ message: "Database not connected" });

        const { username, password } = req.body;

        // Check if both fields are provided
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        // Find user by username
        const user = await db.collection("users").findOne({ username });

        if (!user) {
            return res.status(400).json({ message: "Invalid username" });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, full_name: user.full_name, username: user.username, email: user.email }, 
            JWT_SECRET, 
            { expiresIn: "1h" }
        );

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/my-profile", authenticateToken, async (req, res) => {
    try {
        res.status(200).json({
            full_name: req.user.full_name,
            username: req.user.username,
            email: req.user.email,
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/rental-cars", async (req, res) => {
    try {
        const db = getDB();
        if (!db) return res.status(500).json({ message: "Database not connected" });

        const { year, color, steering_type, number_of_seats } = req.query;
        let filter = {};

        // Apply filters if they exist in query params
        if (year) filter.year = parseInt(year); // Convert year to integer
        if (color) filter.color = color;
        if (steering_type) filter.steering_type = steering_type;
        if (number_of_seats) filter.number_of_seats = parseInt(number_of_seats); // Convert to integer

        // Fetch available cars sorted by price_per_day (ascending)
        const cars = await db.collection("cars").find(filter).sort({ price_per_day: 1 }).toArray();

        res.status(200).json(cars);
    } catch (error) {
        console.error("Error fetching rental cars:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
