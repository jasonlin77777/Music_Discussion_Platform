import { NextResponse } from "next/server";
import { getDocument, updateDocument } from "../../lib/fsUtils.js";

export async function POST(req) {
  const { postId, commentId } = await req.json(); // Assuming postId is also sent
  if (!postId || !commentId) return NextResponse.json({ error: "欄位不足" }, { status: 400 });

  const post = await getDocument("posts", postId);
  if (!post) return NextResponse.json({ error: "找不到貼文" }, { status: 404 });

  const commentIndex = post.comments.findIndex(c => c.id === commentId);
  if (commentIndex === -1) return NextResponse.json({ error: "找不到留言" }, { status: 404 });

  // Create a new array with the updated comment
  const updatedComments = [...post.comments];
  updatedComments[commentIndex] = { ...updatedComments[commentIndex], reported: true };

  await updateDocument("posts", postId, { comments: updatedComments });

  return NextResponse.json({ message: "已檢舉該留言" });
}
