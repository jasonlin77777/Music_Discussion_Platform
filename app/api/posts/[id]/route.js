import { getDocument, updateDocument, deleteDocument, readCollection } from "@/app/lib/fsUtils.js";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = params;

    const post = await getDocument("posts", id);
    if (!post) return NextResponse.json({ error: "找不到貼文" }, { status: 404 });

    return NextResponse.json(post);
  } catch (err) {
    console.error("取得貼文失敗:", err);
    return NextResponse.json({ error: "取得貼文失敗" }, { status: 500 });
  }
}

// 新增留言
export async function POST(req, { params }) {
  try {
    const { id } = params;

    const { user, content } = await req.json();
    if (!user) return NextResponse.json({ error: "尚未登入" }, { status: 401 });

    const post = await getDocument("posts", id);
    if (!post) return NextResponse.json({ error: "貼文不存在" }, { status: 404 });

    const newComment = {
      id: Date.now(), // Consider using a more robust unique ID method if needed
      user,
      content,
      createdAt: new Date().toISOString(),
      likes: [], // Initialize likes
      reported: false,
    };

    const updatedComments = [...post.comments, newComment];
    await updateDocument("posts", id, { comments: updatedComments });

    return NextResponse.json(newComment);
  } catch (err) {
    console.error("新增留言失敗:", err);
    return NextResponse.json({ error: "新增留言失敗" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
    try {
        const { id: postId } = params;
        const body = await req.json();

        // Get current user from session
        const sessions = await readCollection("sessions");
        if (sessions.length === 0) {
            return NextResponse.json({ error: "尚未登入" }, { status: 401 });
        }
        const currentUser = sessions[0];

        // Get the post to check for ownership
        const post = await getDocument("posts", postId);
        if (!post) {
            return NextResponse.json({ error: "找不到貼文" }, { status: 404 });
        }

        // Check if the current user is the author of the post
        if (post.user.id !== currentUser.id) {
            return NextResponse.json({ error: "沒有權限編輯此貼文" }, { status: 403 });
        }

        // Build the update object, only including defined fields
        const updatedData = {};
        if (body.title) updatedData.title = body.title;
        if (body.content) updatedData.content = body.content;
        if (body.category) updatedData.category = body.category;
        if (body.mediaUrl !== undefined) updatedData.mediaUrl = body.mediaUrl;
        if (body.mediaType !== undefined) updatedData.mediaType = body.mediaType;
        
        // Update the document
        await updateDocument("posts", postId, updatedData);

        return NextResponse.json({ message: "貼文已更新", post: { ...post, ...updatedData } });

    } catch (err) {
        console.error("更新貼文失敗:", err);
        return NextResponse.json({ error: "更新貼文失敗" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
  try {
    const { id: postId } = params;

    // Get current user from session
    const sessions = await readCollection("sessions");
    if (sessions.length === 0) {
      return NextResponse.json({ error: "尚未登入" }, { status: 401 });
    }
    const sessionUser = sessions[0];

    // Fetch the full user document to check their role
    const userDoc = await getDocument("users", sessionUser.id);
    if (!userDoc) {
      return NextResponse.json({ error: "無效的使用者" }, { status: 403 });
    }
    const currentUser = userDoc;

    // Get the post to check for ownership
    const post = await getDocument("posts", postId);
    if (!post) {
      return NextResponse.json({ error: "找不到貼文" }, { status: 404 });
    }

    // Check if the current user is the author OR an admin
    const isAuthor = post.user.id === currentUser.id;
    const isAdmin = currentUser.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "沒有權限刪除此貼文" }, { status: 403 });
    }

    // Delete the document
    await deleteDocument("posts", postId);

    return NextResponse.json({ message: "貼文已刪除" });

  } catch (err) {
    console.error("刪除貼文失敗:", err);
    return NextResponse.json({ error: "刪除貼文失敗" }, { status: 500 });
  }
}
