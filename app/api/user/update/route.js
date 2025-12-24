import { NextResponse } from "next/server";
import { readCollection, getDocument, updateDocument, setDocument } from "@/app/lib/fsUtils.js";
import { readCollection as readSessions } from "@/app/lib/fsUtils.js"; // Alias for clarity

export async function PUT(req) {
  try {
    const { name, bio, avatar } = await req.json();

    // Get logged-in user from session
    const sessions = await readSessions("sessions");
    const loggedInUserSession = sessions[0]; // Assuming the first user in session is the logged-in one.
    if (!loggedInUserSession) return NextResponse.json({ error: "尚未登入" }, { status: 401 });

    // Get the actual user document from the 'users' collection
    const userDoc = await getDocument("users", loggedInUserSession.id);
    if (!userDoc) return NextResponse.json({ error: "找不到使用者" }, { status: 404 });

    const updatedUserData = {
      name: name || userDoc.name, // Use existing name if not provided
      bio: bio || userDoc.bio,     // Use existing bio if not provided
      avatar: avatar || userDoc.avatar, // Use existing avatar if not provided
    };

    // Update user in Firestore
    await updateDocument("users", userDoc.id, updatedUserData);

    // Also update the session
    const updatedUserInSession = { ...loggedInUserSession, ...updatedUserData };
    await setDocument("sessions", loggedInUserSession.id, updatedUserInSession);

    return NextResponse.json({ message: "更新成功", user: updatedUserInSession });

  } catch (err) {
    console.error("更新個人資料失敗:", err);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
