import { NextResponse } from "next/server";
import { getDocument, updateDocument, readCollection } from "@/app/lib/fsUtils";

export async function POST(req, { params }) {
  try {
    const { id: postId, commentId } = params;

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

    // Find the comment index
    const commentIndex = post.comments.findIndex(c => c.id.toString() === commentId);
    if (commentIndex === -1) {
      return NextResponse.json({ error: "找不到留言" }, { status: 404 });
    }

    // Initialize likes array if it doesn't exist on the comment
    const comment = post.comments[commentIndex];
    const likes = comment.likes || [];
    
    let updatedLikes;
    if (likes.includes(userId)) {
      // User has already liked the comment, so unlike it
      updatedLikes = likes.filter(id => id !== userId);
    } else {
      // User has not liked the comment, so like it
      updatedLikes = [...likes, userId];
    }
    
    // Create a new comments array with the updated comment
    const updatedComments = [...post.comments];
    updatedComments[commentIndex] = {
      ...comment,
      likes: updatedLikes,
    };

    // Update the post document with the new comments array
    await updateDocument("posts", postId, { comments: updatedComments });

    return NextResponse.json({ likes: updatedLikes });

  } catch (err) {
    console.error("留言按讚失敗:", err);
    return NextResponse.json({ error: "留言按讚失敗" }, { status: 500 });
  }
}
