import { MongoClient } from 'mongodb';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const lessonsPath = path.join(projectRoot, 'lessons.json');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://your-username:your-password@your-cluster.mongodb.net/';
const DATABASE_NAME = process.env.DATABASE_NAME || 'afterschool_classes';

async function run() {
  let client;
  try {
    const raw = await fs.readFile(lessonsPath, 'utf-8');
    const lessons = JSON.parse(raw);

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    const lessonsCol = db.collection('lessons');

    // reset collection so it contains exactly the lessons from lessons.json
    await lessonsCol.deleteMany({});
    const result = await lessonsCol.insertMany(lessons);

    // indexes to help text search on subject and location
    await lessonsCol.createIndex({ subject: 'text', location: 'text' });

    const count = result.insertedCount ?? Object.keys(result.insertedIds).length;
    console.log(`Inserted ${count} lessons into '${DATABASE_NAME}.lessons'`);
  } catch (err) {
    console.error('Seed error:', err);
    process.exitCode = 1;
  } finally {
    if (client) await client.close();
  }
}

run();
