// ========================================
// DATABASE INITIALIZATION SCRIPT
// ========================================
// This script populates the MongoDB database with initial lesson data
// Run this once to set up your database with sample lessons

import { MongoClient } from 'mongodb';

// IMPORTANT: Replace with your MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://your-username:your-password@your-cluster.mongodb.net/';
const DATABASE_NAME = 'afterschool_classes';

// Sample lesson data (at least 10 lessons as required)
const sampleLessons = [
    {
        subject: 'Mathematics',
        location: 'Hendon',
        price: 100,
        spaces: 5,
        icon: 'fa-calculator',
        description: 'Advanced math tutoring for all levels'
    },
    {
        subject: 'English Literature',
        location: 'Colindale',
        price: 80,
        spaces: 5,
        icon: 'fa-book',
        description: 'Improve reading comprehension and writing skills'
    },
    {
        subject: 'Science',
        location: 'Brent Cross',
        price: 90,
        spaces: 5,
        icon: 'fa-flask',
        description: 'Hands-on experiments and scientific concepts'
    },
    {
        subject: 'Computer Programming',
        location: 'Golders Green',
        price: 95,
        spaces: 5,
        icon: 'fa-laptop-code',
        description: 'Learn coding with Python and JavaScript'
    },
    {
        subject: 'Art & Design',
        location: 'Hendon',
        price: 75,
        spaces: 5,
        icon: 'fa-palette',
        description: 'Explore creativity through various art mediums'
    },
    {
        subject: 'Music Theory',
        location: 'Colindale',
        price: 85,
        spaces: 5,
        icon: 'fa-music',
        description: 'Understand musical notation and composition'
    },
    {
        subject: 'Physical Education',
        location: 'Brent Cross',
        price: 70,
        spaces: 5,
        icon: 'fa-running',
        description: 'Stay active with sports and fitness activities'
    },
    {
        subject: 'History',
        location: 'Golders Green',
        price: 80,
        spaces: 5,
        icon: 'fa-landmark',
        description: 'Journey through world history and cultures'
    },
    {
        subject: 'Geography',
        location: 'Hendon',
        price: 78,
        spaces: 5,
        icon: 'fa-globe',
        description: 'Explore world geography and environmental science'
    },
    {
        subject: 'Spanish Language',
        location: 'Colindale',
        price: 88,
        spaces: 5,
        icon: 'fa-language',
        description: 'Learn conversational Spanish for beginners'
    },
    {
        subject: 'Chemistry',
        location: 'Brent Cross',
        price: 92,
        spaces: 5,
        icon: 'fa-atom',
        description: 'Understand chemical reactions and elements'
    },
    {
        subject: 'Drama & Theatre',
        location: 'Golders Green',
        price: 82,
        spaces: 5,
        icon: 'fa-theater-masks',
        description: 'Develop acting skills and stage presence'
    }
];

// Function to initialize the database
async function initializeDatabase() {
    let client;
    
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('✅ Connected to MongoDB successfully');
        
        // Get database reference
        const db = client.db(DATABASE_NAME);
        
        // Clear existing lessons (optional - remove this if you want to keep existing data)
        console.log('Clearing existing lessons...');
        await db.collection('lessons').deleteMany({});
        
        // Insert sample lessons
        console.log('Inserting sample lessons...');
        const result = await db.collection('lessons').insertMany(sampleLessons);
        console.log(`✅ Successfully inserted ${result.insertedCount} lessons`);
        
        // Create indexes for better search performance
        console.log('Creating indexes...');
        await db.collection('lessons').createIndex({ subject: 'text', location: 'text' });
        console.log('✅ Indexes created successfully');
        
        // Display inserted lessons
        console.log('\n📚 Inserted Lessons:');
        sampleLessons.forEach((lesson, index) => {
            console.log(`${index + 1}. ${lesson.subject} - ${lesson.location} - $${lesson.price} - ${lesson.spaces} spaces`);
        });
        
    } catch (error) {
        console.error('❌ Error initializing database:', error);
    } finally {
        // Close the connection
        if (client) {
            await client.close();
            console.log('\n✅ Database connection closed');
        }
    }
}

// Run the initialization
initializeDatabase();
