import { NextResponse } from "next/server";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, getDoc, addDoc, query, orderBy, startAfter, limit, doc } from "firebase/firestore";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const pageLimit = parseInt(searchParams.get('limit')) || 10;
    const cursor = searchParams.get('cursor');

    const postsRef = collection(db, "posts");
    let q;

    if (cursor) {
      const cursorDoc = await getDoc(doc(db, "posts", cursor));
      if (!cursorDoc.exists()) {
        return NextResponse.json({ error: "無效的游標" }, { status: 400 });
      }
      q = query(postsRef, orderBy("createdAt", "desc"), startAfter(cursorDoc), limit(pageLimit));
    } else {
      q = query(postsRef, orderBy("createdAt", "desc"), limit(pageLimit));
    }

    const querySnapshot = await getDocs(q);
    
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get the last visible document to be used as the next cursor
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    const nextCursor = lastVisible ? lastVisible.id : null;

    return NextResponse.json({ posts, nextCursor });

  } catch (err) {
    console.error("取得貼文失敗:", err);
    return NextResponse.json({ error: "取得貼文失敗" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { title, content, category, user, mediaUrl, mediaType, imageUrl, tags } = await req.json();

    if (!user) return NextResponse.json({ error: "尚未登入" }, { status: 401 });

    const newPost = {
      title,
      content,
      category,
      user,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
      imageUrl: imageUrl || null,
      tags: tags || [], // Add tags array
      createdAt: new Date().toISOString(),
      comments: [],
      likes: [],
    };

    const docRef = await addDoc(collection(db, "posts"), newPost);
    
    const addedPost = { id: docRef.id, ...newPost };

    return NextResponse.json(addedPost);
  } catch (err) {
    console.error("發文失敗:", err);
    return NextResponse.json({ error: "發文失敗" }, { status: 500 });
  }
}