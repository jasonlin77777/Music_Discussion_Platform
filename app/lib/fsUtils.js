import { db } from './firebase'; // Import db from your firebase.js
import { collection, getDocs, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

// Old fs-based functions (commented out for now)
// import fs from "fs";
// import path from "path";

// export async function readData(filename) {
//   const filePath = path.join(process.cwd(), "app/data", filename);
//   try {
//     const data = await fs.promises.readFile(filePath, "utf-8");
//     return data ? JSON.parse(data) : [];
//   } catch (err) {
//     console.error("讀取失敗:", err);
//     return [];
//   }
// }

// export async function writeData(filename, data) {
//   const filePath = path.join(process.cwd(), "app/data", filename);
//   await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
// }

// Firestore-based functions
export async function readCollection(collectionName) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return data;
  } catch (error) {
    console.error(`Error reading collection ${collectionName}:`, error);
    return [];
  }
}

export async function getDocument(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error(`Error getting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
}

export async function addDocument(collectionName, data) {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    console.log("Document written with ID: ", docRef.id);
    return { id: docRef.id, ...data };
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
}

export async function updateDocument(collectionName, docId, data) {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
    console.log("Document with ID updated: ", docId);
  } catch (e) {
    console.error("Error updating document: ", e);
    throw e;
  }
}

export async function setDocument(collectionName, docId, data) {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data, { merge: true }); // merge: true will merge new data with existing document
    console.log("Document with ID set: ", docId);
  } catch (e) {
    console.error("Error setting document: ", e);
    throw e;
  }
}

export async function deleteDocument(collectionName, docId) {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    console.log("Document with ID deleted: ", docId);
  } catch (e) {
    console.error("Error deleting document: ", e);
    throw e;
  }
}

export async function getPostsByUserId(userId) {
  try {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, where("user.id", "==", userId));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return data;
  } catch (error) {
    console.error(`Error reading posts for user ${userId}:`, error);
    return [];
  }
}

// 存檔上傳檔案 (Keep this as is for now)
export async function saveFile(file, destPath) {
  // Original implementation relies on 'fs' which is commented out.
  // This function will need to be re-evaluated if used in a serverless context or client-side.
  // For now, leaving it as a placeholder.
  console.warn("saveFile function is currently disabled as 'fs' import is commented out.");
  // const buffer = Buffer.from(await file.arrayBuffer());
  // await fs.promises.writeFile(destPath, buffer);
}
