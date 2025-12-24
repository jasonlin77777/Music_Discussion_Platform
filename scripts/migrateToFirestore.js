import fs from 'fs';
import path from 'path';
// Ensure firebase is initialized before importing db
import '../app/lib/firebase.js'; // This ensures Firebase app is initialized
import { addDocument } from '../app/lib/fsUtils.js';

async function migrateData() {
  console.log("Starting data migration to Firestore...");

  const dataDir = path.join(process.cwd(), 'app', 'data');

  // Migrate users.json
  try {
    const usersPath = path.join(dataDir, 'users.json');
    const usersData = JSON.parse(await fs.promises.readFile(usersPath, 'utf-8'));
    console.log(`Migrating ${usersData.length} users...`);
    for (const user of usersData) {
      // Use setDocument if you want to preserve the 'id' field as the document ID
      // For now, using addDocument will generate new Firestore IDs, which is safer
      // if the original 'id' was not globally unique or compatible with Firestore document IDs.
      await addDocument('users', user);
    }
    console.log("Users migration complete.");
  } catch (error) {
    console.error("Error migrating users:", error);
  }

  // Migrate posts.json
  try {
    const postsPath = path.join(dataDir, 'posts.json');
    const postsData = JSON.parse(await fs.promises.readFile(postsPath, 'utf-8'));
    console.log(`Migrating ${postsData.length} posts...`);
    for (const post of postsData) {
      await addDocument('posts', post);
    }
    console.log("Posts migration complete.");
  } catch (error) {
    console.error("Error migrating posts:", error);
  }

  console.log("Data migration to Firestore finished.");
}

migrateData().catch(console.error);
