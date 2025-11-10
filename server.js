
// Express.js - Web framework for creating the server and handling routes
import express from 'express';
// MongoDB - Official MongoDB driver for connecting to MongoDB Atlas database
import { MongoClient, ObjectId } from 'mongodb';
// CORS - Middleware to enable Cross-Origin Resource Sharing (allows frontend to communicate with backend)
import cors from 'cors';
// Path - Node.js built-in module for handling file paths
import path from 'path';
// URL - Node.js built-in module for working with URLs
import { fileURLToPath } from 'url';
// Dotenv - Load environment variables from .env
import dotenv from 'dotenv';
dotenv.config();

// ========================================
// CONFIGURATION
// ========================================
// Get the directory name (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB Atlas connection string
// IMPORTANT: Uses environment variable if provided, falls back to placeholder
// Format: mongodb+srv://username:password@cluster.mongodb.net/database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://your-username:your-password@your-cluster.mongodb.net/';
const DATABASE_NAME = process.env.DATABASE_NAME || 'afterschool_lessons'; // Name of the database
const PORT = process.env.PORT || 3000; // Server port (use environment variable or default to 3000)

// ========================================
// CREATE EXPRESS APPLICATION
// ========================================
const app = express();
// Pretty-print JSON responses
app.set('json spaces', 2);

// ========================================
// MIDDLEWARE FUNCTIONS
// ========================================
// Middleware are functions that run before your route handlers
// They can modify the request/response or perform actions

// 1. CORS Middleware - Allows requests from any origin (frontend can be on different domain)
app.use(cors());

// 2. JSON Parser Middleware - Automatically parses incoming JSON data in request body
app.use(express.json());

// 3. LOGGER MIDDLEWARE - Custom middleware that logs all incoming requests
// This helps with debugging and monitoring server activity
app.use((req, res, next) => {
    // Get current timestamp
    const timestamp = new Date().toISOString();
    
    // Log request details to console
    console.log('========================================');
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    console.log(`IP Address: ${req.ip}`);
    console.log(`User-Agent: ${req.get('user-agent')}`);
    
    // If there's a request body, log it (useful for POST/PUT requests)
    if (Object.keys(req.body).length > 0) {
        console.log('Request Body:', JSON.stringify(req.body, null, 2));
    }
    console.log('========================================');
    
    // Call next() to pass control to the next middleware/route handler
    next();
});

// 4. STATIC FILE MIDDLEWARE - Serves static files (like images) from the 'public' folder
// Example: If you request /images/math.jpg, it will serve backend/public/images/math.jpg
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Handle errors for missing static files
app.use('/images', (req, res) => {
    res.status(404).json({ 
        error: 'Image not found',
        message: `The requested image ${req.url} does not exist on the server`
    });
});

// ========================================
// MONGODB CONNECTION
// ========================================
let db; // Variable to store database connection

// Function to connect to MongoDB Atlas
async function connectToDatabase() {
    try {
        // Create a new MongoDB client with connection string
        const client = new MongoClient(MONGODB_URI);
        // Connect to the database
        await client.connect();
        console.log('✅ Successfully connected to MongoDB Atlas');
        
        // Get reference to the database
        db = client.db(DATABASE_NAME);
        
        // Test the connection by listing collections
        const collections = await db.listCollections().toArray();
        console.log('📚 Available collections:', collections.map(c => c.name).join(', '));
        
        return db;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1); // Exit if database connection fails
    }
}

// ========================================
// REST API ROUTES
// ========================================

// ROOT ROUTE - Welcome message
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to After School Classes API',
        version: '1.0.0',
        endpoints: {
            lessons: 'GET /lessons - Get all lessons',
            search: 'GET /search?q=query - Search lessons',
            order: 'POST /order - Create a new order',
            updateLesson: 'PUT /lessons/:id - Update lesson spaces'
        }
    });
});

// ========================================
// GET /lessons - Retrieve all lessons
// ========================================
// This endpoint returns all available lessons from the database
app.get('/lessons', async (req, res) => {
    try {
        // Access the 'lessons' collection in MongoDB
        const lessonsCollection = db.collection('lessons');
        
        // Find all lessons and convert to array
        // The empty object {} means "find all documents"
        const lessons = await lessonsCollection.find({}).toArray();
        
        // Log how many lessons were found
        console.log(`📖 Retrieved ${lessons.length} lessons from database`);
        
        // Send lessons as JSON response
        res.json(lessons);
    } catch (error) {
        // If there's an error, log it and send error response
        console.error('Error fetching lessons:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve lessons',
            details: error.message 
        });
    }
});

// ========================================
// GET /search - Search lessons (Challenge Component)
// ========================================
// This endpoint allows searching across all lesson fields
// Example: /search?q=math will find all lessons with "math" in any field
app.get('/search', async (req, res) => {
    try {
        // Get the search query from URL parameter
        const searchQuery = req.query.q || '';
        
        // If no search query provided, return all lessons
        if (!searchQuery) {
            const lessonsCollection = db.collection('lessons');
            const lessons = await lessonsCollection.find({}).toArray();
            return res.json(lessons);
        }
        
        // Access the 'lessons' collection
        const lessonsCollection = db.collection('lessons');
        
        // Create a regex pattern for case-insensitive search
        // 'i' flag makes it case-insensitive
        const searchRegex = new RegExp(searchQuery, 'i');
        
        // MongoDB query using $or operator to search across multiple fields
        // This searches in subject, location, price (as string), and spaces (as string)
        const searchResults = await lessonsCollection.find({
            $or: [
                { subject: searchRegex },
                { location: searchRegex },
                // Convert numbers to strings for searching
                { $expr: { $regexMatch: { input: { $toString: "$price" }, regex: searchQuery, options: "i" } } },
                { $expr: { $regexMatch: { input: { $toString: "$spaces" }, regex: searchQuery, options: "i" } } }
            ]
        }).toArray();
        
        console.log(`🔍 Search for "${searchQuery}" returned ${searchResults.length} results`);
        
        // Return search results
        res.json(searchResults);
    } catch (error) {
        console.error('Error searching lessons:', error);
        res.status(500).json({ 
            error: 'Search failed',
            details: error.message 
        });
    }
});

// ========================================
// POST /order - Create a new order
// ========================================
// This endpoint saves a new order to the database
// Expected request body: { name, phone, lessonIds, spaces }
app.post('/order', async (req, res) => {
    try {
        // Extract order data from request body
        const orderData = req.body;
        
        // Validate required fields
        if (!orderData.name || !orderData.phone || !orderData.lessonIds) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['name', 'phone', 'lessonIds', 'spaces']
            });
        }
        
        // Access the 'orders' collection
        const ordersCollection = db.collection('orders');
        
        // Add timestamp to order
        orderData.orderDate = new Date();
        
        // Insert the order into the database
        const result = await ordersCollection.insertOne(orderData);
        
        console.log(`✅ New order created with ID: ${result.insertedId}`);
        
        // Send success response with the new order ID
        res.status(201).json({
            message: 'Order created successfully',
            orderId: result.insertedId,
            order: orderData
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ 
            error: 'Failed to create order',
            details: error.message 
        });
    }
});

// ========================================
// PUT /lessons/:id - Update lesson spaces
// ========================================
// This endpoint updates the available spaces for a specific lesson
// :id is a URL parameter (e.g., /lessons/507f1f77bcf86cd799439011)
app.put('/lessons/:id', async (req, res) => {
    try {
        // Get lesson ID from URL parameter
        const lessonId = req.params.id;
        
        // Get the new spaces value from request body
        const { spaces } = req.body;
        
        // Validate that spaces is provided and is a number
        if (spaces === undefined || typeof spaces !== 'number') {
            return res.status(400).json({ 
                error: 'Invalid request',
                message: 'Please provide a valid number for spaces'
            });
        }
        
        // Validate that spaces is not negative
        if (spaces < 0) {
            return res.status(400).json({ 
                error: 'Invalid value',
                message: 'Spaces cannot be negative'
            });
        }
        
        // Access the 'lessons' collection
        const lessonsCollection = db.collection('lessons');
        
        // Update the lesson in the database
        // findOneAndUpdate finds a document and updates it in one operation
        const result = await lessonsCollection.findOneAndUpdate(
            { _id: new ObjectId(lessonId) }, // Find lesson by ID
            { $set: { spaces: spaces } },    // Set new spaces value
            { returnDocument: 'after' }       // Return the updated document
        );
        
        // Check if lesson was found
        if (!result) {
            return res.status(404).json({ 
                error: 'Lesson not found',
                message: `No lesson found with ID: ${lessonId}`
            });
        }
        
        console.log(`✏️ Updated lesson ${lessonId} - New spaces: ${spaces}`);
        
        // Send success response
        res.json({
            message: 'Lesson updated successfully',
            lesson: result
        });
    } catch (error) {
        console.error('Error updating lesson:', error);
        res.status(500).json({ 
            error: 'Failed to update lesson',
            details: error.message 
        });
    }
});

// ========================================
// START THE SERVER
// ========================================
// First connect to database, then start the Express server
connectToDatabase().then(() => {
    app.listen(PORT, () => {
        console.log('========================================');
        console.log('🚀 After School Classes API Server');
        console.log(`📡 Server is running on port ${PORT}`);
        console.log(`🌐 API URL: http://localhost:${PORT}`);
        console.log('========================================');
    });
});
