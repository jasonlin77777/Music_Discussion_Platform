import { NextResponse } from "next/server";
import { updateDocument, readCollection } from "@/app/lib/fsUtils";

// 這是一個臨時的管理員 API，用於將指定 email 的使用者提升為管理員。
// 出於安全考量，這個功能在完成後應被移除或加上更嚴格的權限控制。
export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "請提供使用者的 email" }, { status: 400 });
    }

    // 從 Firestore 讀取所有使用者
    const users = await readCollection("users");
    const userToPromote = users.find(u => u.email === email);

    if (!userToPromote) {
      return NextResponse.json({ error: "找不到該 email 的使用者" }, { status: 404 });
    }

    // 更新 Firestore 中的使用者文件，加入 role: 'admin'
    await updateDocument("users", userToPromote.id, { role: "admin" });

    return NextResponse.json({ message: `使用者 ${email} 已成功提升為管理員。請重新登入以啟用權限。` });

  } catch (err) {
    console.error("提升管理員失敗:", err);
    return NextResponse.json({ error: `操作失敗: ${err.message}` }, { status: 500 });
  }
}
