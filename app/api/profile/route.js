import { readCollection, setDocument, updateDocument } from "@/app/lib/fsUtils.js"; // Import new functions
import { NextResponse } from "next/server";

// Import firebase storage functions later if needed
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { storage } from "../../lib/firebase"; // Assuming storage is also exported from firebase.js

export async function POST(req) {
  try {
    const formData = await req.formData(); // 支援檔案上傳
    const name = formData.get("name");
    const bio = formData.get("bio");
    const avatarFile = formData.get("avatar"); // File

    // 讀取使用者 session
    const session = await readCollection("sessions");
    if (session.length === 0) return NextResponse.json({ error: "尚未登入" }, { status: 401 });

    const user = session[0];

    // 處理 avatar 檔案 - *** IMPORTANT: This needs to be migrated to Firebase Storage ***
    let avatarPath = user.avatar || "";
    if (avatarFile && avatarFile.size > 0) {
      // Placeholder for Firebase Storage upload
      console.warn("Avatar file upload is currently using a placeholder. Needs Firebase Storage integration.");
      // Example of Firebase Storage upload (requires storage to be set up)
      /*
      const storageRef = ref(storage, `avatars/${user.id}-${Date.now()}-${avatarFile.name}`);
      const snapshot = await uploadBytes(storageRef, avatarFile);
      avatarPath = await getDownloadURL(snapshot.ref);
      */
    }

    // 更新使用者資料
    const updatedUser = { ...user, name, bio, avatar: avatarPath };

    // 更新 sessions collection in Firestore
    // Assuming user.id is the Firestore Document ID for the session
    await setDocument("sessions", user.id, updatedUser);

    // 同步更新 users collection in Firestore
    // Assuming user.id is the Firestore Document ID for the user
    await updateDocument("users", user.id, { name, bio, avatar: avatarPath });

    return NextResponse.json({ user: updatedUser }); // 一定回 JSON
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}
