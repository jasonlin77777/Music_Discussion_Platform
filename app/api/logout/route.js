import { readCollection, deleteDocument } from "@/app/lib/fsUtils.js";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const sessions = await readCollection("sessions");
    const deletePromises = sessions.map(session => deleteDocument("sessions", session.id));
    await Promise.all(deletePromises);
    
    return NextResponse.json({ message: "已登出" });
  } catch (err) {
    console.error("登出失敗:", err);
    return NextResponse.json({ error: "登出失敗" }, { status: 500 });
  }
}
