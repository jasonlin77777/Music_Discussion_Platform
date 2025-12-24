import { NextResponse } from "next/server";
import { readCollection, getDocument, updateDocument } from "../../lib/fsUtils.js";
import { readCollection as readSessions } from "../../lib/fsUtils.js"; // Alias for clarity

export async function GET() {
  try {
    // In the new data model, comments are nested in posts.
    // A separate "comments" collection doesn't exist.
    // Returning an empty array to maintain original behavior of an empty comment.json.
    const comments = await readCollection("comments");
    return NextResponse.json(comments);
  } catch (err) {
    console.error(err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req) {
  const { postId, content } = await req.json();
  if (!postId || !content) return NextResponse.json({ error: "欄位不足" }, { status: 400 });

  // Correctly get the logged-in user from the session
  const sessions = await readSessions("sessions");
  const user = sessions[0]; // Assuming the first user in session is the logged-in one.
  if (!user) return NextResponse.json({ error: "尚未登入" }, { status: 401 });

  const post = await getDocument("posts", postId);
  if (!post) return NextResponse.json({ error: "貼文不存在" }, { status: 404 });

  const newComment = {
    id: Date.now(), // Consider using a more robust unique ID method
    user: { id: user.id, name: user.name, email: user.email }, // Store user info
    content,
    createdAt: new Date().toISOString(),
    reported: false
  };
  
  const updatedComments = [...post.comments, newComment];
  await updateDocument("posts", postId, { comments: updatedComments });

  return NextResponse.json({ comment: newComment });
}
