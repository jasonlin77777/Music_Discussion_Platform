import { NextResponse } from "next/server";
import { getDocument, updateDocument } from "@/app/lib/fsUtils.js";

export async function POST(req) {
  const { postId } = await req.json();

  const post = await getDocument("posts", postId);
  if (!post) return NextResponse.json({ error: "找不到貼文" }, { status: 404 });

  await updateDocument("posts", postId, { reported: true });

  return NextResponse.json({ message: "已檢舉該貼文" });
}
