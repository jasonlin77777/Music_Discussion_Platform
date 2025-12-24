import { NextResponse } from "next/server";
import { readCollection, getDocument, updateDocument, setDocument } from "@/app/lib/fsUtils.js"; // Import new functions
import { readCollection as readSessions } from "@/app/lib/fsUtils.js"; // Alias for clarity

export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = formData.get("name");
    const bio = formData.get("bio");
    const avatar = formData.get("avatar"); // File

    if (!name) return NextResponse.json({ error: "暱稱不能為空" }, { status: 400 });

    // Get logged-in user from session
    const sessions = await readSessions("sessions");
    const loggedInUserSession = sessions[0]; // Assuming the first user in session is the logged-in one.
    if (!loggedInUserSession) return NextResponse.json({ error: "尚未登入" }, { status: 401 });

    // Get the actual user document from the 'users' collection
    const userDoc = await getDocument("users", loggedInUserSession.id);
    if (!userDoc) return NextResponse.json({ error: "找不到使用者" }, { status: 404 });

    let avatarPath = userDoc.avatar || "";
    if (avatar && avatar.size > 0) {
      // Placeholder for Firebase Storage upload
      console.warn("Avatar file upload is currently using a placeholder. Needs Firebase Storage integration.");
      // Example of Firebase Storage upload (requires storage to be set up)
      /*
      const storageRef = ref(storage, `avatars/${userDoc.id}-${Date.now()}-${avatar.name}`);
      const snapshot = await uploadBytes(storageRef, avatar);
      avatarPath = await getDownloadURL(snapshot.ref);
      */
    }

    const updatedUserData = {
      name: name,
      bio: bio,
      avatar: avatarPath,
    };

    // Update user in Firestore
    await updateDocument("users", userDoc.id, updatedUserData);

    // Also update the session if the user's name or avatar changes
    const updatedUserInSession = { ...loggedInUserSession, ...updatedUserData };
    await setDocument("sessions", loggedInUserSession.id, updatedUserInSession);

    return NextResponse.json({ user: updatedUserInSession });

  } catch (err) {
    console.error("更新個人資料失敗:", err);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
