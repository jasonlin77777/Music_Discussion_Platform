"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [message, setMessage] = useState("");

  // 取得登入使用者
  useEffect(() => {
    fetch("/api/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) setUser(data.user);
      });
  }, []);

  // 取得單篇貼文 + 評論
  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => setPost(data.find(p => p.id === parseInt(id)) || null));

    fetch("/api/comments")
      .then((res) => res.json())
      .then((data) => setComments(data.filter(c => c.postId === parseInt(id))));
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return setMessage("請先登入才能留言");
    if (!newComment) return;

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: parseInt(id), content: newComment }),
    });
    const data = await res.json();
    if (data.comment) {
      setComments([...comments, data.comment]);
      setNewComment("");
      setMessage("留言成功");
    } else {
      setMessage(data.error);
    }
  };

  const handleReportComment = async (commentId) => {
    const res = await fetch("/api/comments/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId }),
    });
    const data = await res.json();
    alert(data.message || data.error);
  };

  const handleReportPost = async () => {
    if (!user) return alert("請先登入才能檢舉貼文");
    const res = await fetch("/api/posts/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: parseInt(id) }),
    });
    const data = await res.json();
    alert(data.message || data.error);
  };

  if (!post) return <p>貼文不存在或正在載入...</p>;

  return (
    <div style={{ maxWidth: "700px", margin: "50px auto" }}>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <p style={{ fontSize: "0.9em", color: "#555" }}>
        分類: {post.category} | 作者: {post.author} | {new Date(post.createdAt).toLocaleString()}
        {user && ( // Only show report button if a user is logged in
          <button onClick={handleReportPost} style={{ color: "red", marginLeft: "10px" }}>
            檢舉貼文
          </button>
        )}
      </p>

      <hr style={{ margin: "20px 0" }} />

      <h3>💬 留言區</h3>
      {comments.length === 0 && <p>目前沒有留言</p>}
      {comments.map((c) => (
        <div key={c.id} style={{ borderBottom: "1px solid #ddd", padding: "5px 0" }}>
          <p>{c.content}</p>
          <p style={{ fontSize: "0.8em", color: "#555" }}>
            {c.author} | {new Date(c.createdAt).toLocaleString()}{" "}
            <button onClick={() => handleReportComment(c.id)} style={{ color: "red", marginLeft: "10px" }}>
              檢舉
            </button>
          </p>
        </div>
      ))}

      <form onSubmit={handleComment} style={{ marginTop: "10px" }}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="留言..."
          style={{ width: "100%", padding: "8px", marginBottom: "5px", height: "80px" }}
        />
        <button type="submit">送出留言</button>
      </form>
      {message && <p style={{ marginTop: "10px", color: "green" }}>{message}</p>}
    </div>
  );
}
