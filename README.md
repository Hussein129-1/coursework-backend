# After School Classes - Backend API

This is the Express.js backend server for the After School Classes booking application.

## Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework for creating REST API
- **MongoDB Atlas** - Cloud database for storing lessons and orders
- **CORS** - Enable cross-origin requests from frontend

## Setup Instructions

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

## Support

For issues or questions, refer to the project documentation or contact the development team.
