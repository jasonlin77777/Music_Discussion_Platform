import { NextResponse } from "next/server";
import { getDocument, updateDocument, readCollection } from "@/app/lib/fsUtils";

export async function PUT(req, { params }) {
    try {
        const { id: postId, commentId } = params;
        const { content } = await req.json();

        if (!content) {
            return NextResponse.json({ error: "留言內容不能為空" }, { status: 400 });
        }

        // Get current user from session
        const sessions = await readCollection("sessions");
        if (sessions.length === 0) {
            return NextResponse.json({ error: "尚未登入" }, { status: 401 });
        }
        const currentUser = sessions[0];

        // Get the post
        const post = await getDocument("posts", postId);
        if (!post) {
            return NextResponse.json({ error: "找不到貼文" }, { status: 404 });
        }

        // Find the comment and check ownership
        const commentIndex = post.comments.findIndex(c => c.id.toString() === commentId);
        if (commentIndex === -1) {
            return NextResponse.json({ error: "找不到留言" }, { status: 404 });
        }

        if (post.comments[commentIndex].user.id !== currentUser.id) {
            return NextResponse.json({ error: "沒有權限編輯此留言" }, { status: 403 });
        }

        // Create a new comments array with the updated content
        const updatedComments = [...post.comments];
        updatedComments[commentIndex] = {
            ...updatedComments[commentIndex],
            content: content,
            updatedAt: new Date().toISOString(), // Add an updated timestamp
        };

        // Update the post document
        await updateDocument("posts", postId, { comments: updatedComments });

        return NextResponse.json({ message: "留言已更新", comment: updatedComments[commentIndex] });

    } catch (err) {
        console.error("更新留言失敗:", err);
        return NextResponse.json({ error: "更新留言失敗" }, { status: 500 });
    }
}


export async function DELETE(req, { params }) {
    try {
        const { id: postId, commentId } = params;

        // Get current user from session
        const sessions = await readCollection("sessions");
        if (sessions.length === 0) {
            return NextResponse.json({ error: "尚未登入" }, { status: 401 });
        }
        const currentUser = sessions[0];

        // Get the post
        const post = await getDocument("posts", postId);
        if (!post) {
            return NextResponse.json({ error: "找不到貼文" }, { status: 404 });
        }

        // Find the comment and check ownership
        const commentToDelete = post.comments.find(c => c.id.toString() === commentId);
        if (!commentToDelete) {
            return NextResponse.json({ error: "找不到留言" }, { status: 404 });
        }

        if (commentToDelete.user.id !== currentUser.id) {
            return NextResponse.json({ error: "沒有權限刪除此留言" }, { status: 403 });
        }

        // Filter out the deleted comment
        const updatedComments = post.comments.filter(c => c.id.toString() !== commentId);

        // Update the post document
        await updateDocument("posts", postId, { comments: updatedComments });

        return NextResponse.json({ message: "留言已刪除" });

    } catch (err) {
        console.error("刪除留言失敗:", err);
        return NextResponse.json({ error: "刪除留言失敗" }, { status: 500 });
    }
}
