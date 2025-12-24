import { NextResponse } from "next/server";
import { readCollection, addDocument, setDocument } from "@/app/lib/fsUtils.js"; // Import setDocument

export async function POST(req) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "所有欄位皆必填" }, { status: 400 });
    }

    // Read users from Firestore collection
    const users = await readCollection("users");

    if (users.find((u) => u.email === email)) {
      return NextResponse.json({ error: "帳號已存在" }, { status: 400 });
    }

    // Prepare new user data without manual ID
    const newUser = { email, password, name, bio: "", avatar: "" }; // Add default bio and avatar
    // Add new user to Firestore collection
    const addedUser = await addDocument("users", newUser);

    // Create a session for the new user (auto-login)
    await setDocument("sessions", addedUser.id, addedUser);

    return NextResponse.json({ message: "註冊成功", user: addedUser }); // Return user with Firestore-generated ID
  } catch (err) {
    console.error("註冊失敗:", err);
    return NextResponse.json({ error: "註冊失敗" }, { status: 500 });
  }
}
