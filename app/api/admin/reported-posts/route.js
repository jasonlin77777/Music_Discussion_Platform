import { NextResponse } from "next/server";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, query, where, getDoc, doc } from "firebase/firestore";
import { readCollection } from "@/app/lib/fsUtils";

export async function GET(req) {
    try {
        // 1. Get current user from session
        const sessions = await readCollection("sessions");
        if (sessions.length === 0) {
            return NextResponse.json({ error: "未登入或 Session 無效" }, { status: 401 });
        }
        const sessionUser = sessions[0];

        // 2. Fetch the user's full data to check their role
        const userDoc = await getDoc(doc(db, "users", sessionUser.id));
        if (!userDoc.exists() || userDoc.data().role !== 'admin') {
            return NextResponse.json({ error: "沒有管理員權限" }, { status: 403 });
        }

        // 3. If user is an admin, fetch reported posts
        const postsRef = collection(db, "posts");
        const q = query(postsRef, where("reported", "==", true));
        const querySnapshot = await getDocs(q);
        
        const reportedPosts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json(reportedPosts);

    } catch (err) {
        console.error("取得被檢舉貼文失敗:", err);
        return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
    }
}
