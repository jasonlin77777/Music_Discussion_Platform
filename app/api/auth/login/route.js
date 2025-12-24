import { NextResponse } from "next/server";
import { readCollection, setDocument } from "@/app/lib/fsUtils.js"; // Import setDocument

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    // Read users from Firestore collection
    const users = await readCollection("users");

    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json({ error: "帳號或密碼錯誤" }, { status: 401 });
    }

    // Create a session for the user
    await setDocument("sessions", user.id, user);

    return NextResponse.json({ message: "登入成功", user });
  } catch (err) {
    console.error("登入失敗:", err);
    return NextResponse.json({ error: "登入失敗" }, { status: 500 });
  }
}
