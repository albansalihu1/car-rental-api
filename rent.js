import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let mongodb;

async function connectDB() {
    try {
        await client.connect();
        mongodb = client.db("carRental");
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
}

connectDB();

export function getDB() {
    return mongodb;
}
