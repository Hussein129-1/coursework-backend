# 🎓 After School Classes - Backend API

> A robust RESTful API built with Express.js and MongoDB for managing after-school class bookings

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [API Endpoints](#api-endpoints)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Scripts](#scripts)
- [Project Structure](#project-structure)

## 🌟 Overview

This backend serves as the API layer for the After School Classes booking system. It handles lesson management, search functionality, order processing, and inventory management for available class spaces.
### 1. Install Dependencies

```bash
npm install
```

### 2. Configure MongoDB Connection

Open `server.js` and update the MongoDB connection string:

```javascript
const MONGODB_URI = 'mongodb+srv://your-username:your-password@your-cluster.mongodb.net/';
```

Replace with your actual MongoDB Atlas credentials.

### 3. Initialize Database (First Time Only)

Run the database initialization script to populate sample lessons:

```bash
node init-database.js
```

This will create 12 sample lessons in your MongoDB database.

### 4. Start the Server

For development (with auto-restart):
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### GET /lessons
Returns all available lessons from the database.

**Response:**
```json
[
  {
    "_id": "...",
    "subject": "Mathematics",
    "location": "Hendon",
    "price": 100,
    "spaces": 5,
    "icon": "fa-calculator",
    "description": "Advanced math tutoring"
  }
]
```

### GET /search?q=query
Search lessons by subject, location, price, or spaces.

**Parameters:**
- `q` - Search query string

**Example:** `/search?q=math`

### POST /order
Create a new order in the database.

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "1234567890",
  "lessonIds": ["lesson_id_1", "lesson_id_2"],
  "spaces": {
    "lesson_id_1": 2,
    "lesson_id_2": 1
  }
}
```

### PUT /lessons/:id
Update available spaces for a lesson.

**Parameters:**
- `id` - Lesson ID

**Request Body:**
```json
{
  "spaces": 3
}
```

## Project Structure

```
backend/
├── server.js              # Main Express server with routes and middleware
├── init-database.js       # Database initialization script
├── package.json           # Dependencies and scripts
├── .gitignore            # Git ignore rules
└── public/
    └── images/           # Static lesson images
```

## Middleware

The server includes two custom middleware functions:

1. **Logger Middleware** - Logs all incoming requests with timestamp, method, URL, and IP address
2. **Static File Middleware** - Serves lesson images from the `public/images` folder

## Testing with Postman

Import the Postman collection (included in submission) to test all API endpoints.

## Deployment

### Deploy to Render.com

1. Create account at [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables if needed
7. Deploy!

### Deploy to AWS

Follow the lecture instructions for deploying to AWS Elastic Beanstalk or AWS Lambda.

## Troubleshooting

**Server won't start:**
- Check if MongoDB connection string is correct
- Ensure port 3000 is not already in use
- Verify all dependencies are installed

**Database connection errors:**
- Verify MongoDB Atlas credentials
- Check if IP address is whitelisted in MongoDB Atlas
- Ensure database name is correct

**CORS errors:**
- CORS is enabled for all origins in development
- Update CORS settings for production deployment


