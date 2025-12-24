import { NextResponse } from "next/server";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

export async function GET(req, { params }) {
  try {
    const { tagName } = params;
    
    if (!tagName) {
      return NextResponse.json({ error: "未提供標籤" }, { status: 400 });
    }

    const postsRef = collection(db, "posts");
    // Use 'array-contains' to query for posts that have the tag in their 'tags' array
    const q = query(
      postsRef, 
      where("tags", "array-contains", tagName),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(posts);

  } catch (err) {
    console.error(`取得標籤為 "${params.tagName}" 的貼文失敗:`, err);
    return NextResponse.json({ error: "取得貼文失敗" }, { status: 500 });
  }
}
