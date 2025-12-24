import { NextResponse } from "next/server";
import { getDocument, updateDocument, readCollection } from "@/app/lib/fsUtils";

export async function POST(req, { params }) {
  try {
    const { id: postId } = params;

    // Get current user from session
    const sessions = await readCollection("sessions");
    if (sessions.length === 0) {
      return NextResponse.json({ error: "尚未登入" }, { status: 401 });
    }
    const user = sessions[0];
    const userId = user.id;

    // Get the post
    const post = await getDocument("posts", postId);
    if (!post) {
      return NextResponse.json({ error: "找不到貼文" }, { status: 404 });
    }

    // Initialize likes array if it doesn't exist
    const likes = post.likes || [];
    
    let updatedLikes;
    if (likes.includes(userId)) {
      // User has already liked the post, so unlike it
      updatedLikes = likes.filter(id => id !== userId);
    } else {
      // User has not liked the post, so like it
      updatedLikes = [...likes, userId];
    }

    // Update the document
    await updateDocument("posts", postId, { likes: updatedLikes });

    return NextResponse.json({ likes: updatedLikes });

  } catch (err) {
    console.error("按讚失敗:", err);
    return NextResponse.json({ error: "按讚失敗" }, { status: 500 });
  }
}
