"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { detectMediaType } from '../../../lib/mediaParser';

export default function EditPostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("搖滾");
  const [mediaUrl, setMediaUrl] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const categories = ["搖滾", "古典", "KPOP", "JPOP", "國語歌", "台語歌", "英文歌"];

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        if (!res.ok) {
          throw new Error("找不到貼文或沒有權限");
        }
        const post = await res.json();
        
        // Security check: ensure the logged-in user is the author
        if (!user || user.id !== post.user.id) {
          setError("沒有權限編輯此貼文");
          router.push(`/posts/${postId}`);
          return;
        }

        setTitle(post.title);
        setContent(post.content);
        setCategory(post.category);
        setMediaUrl(post.mediaUrl || "");

      } catch (err) {
        setError(err.message);
      }
    };

    if (postId && user) { // Fetch post only when postId and user are available
      fetchPost();
    } else if (!user) {
        // Handle case where user is not logged in yet
        // You might want to show a loading state or redirect
    }
  }, [postId, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const mediaType = detectMediaType(mediaUrl); // Calculate mediaType
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category, mediaUrl, mediaType }), // Include mediaType
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "更新失敗");
      }

      setMessage("貼文更新成功！正在跳轉...");
      router.push(`/posts/${postId}`);

    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>錯誤: {error}</div>;
  }
  
  if (!title && !content) {
    return <p>載入中...</p>
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto' }}>
      <h2>編輯貼文</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
        <label>標題</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ marginBottom: "10px", padding: "8px" }}
        />
        <label>內容</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          style={{ marginBottom: "10px", padding: "8px", minHeight: "120px" }}
        />
        <label>分類</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ marginBottom: "10px", padding: "8px" }}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <label>YouTube 或 Spotify 連結 (選填)</label>
        <input
          type="url"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          placeholder="貼上連結"
          style={{ marginBottom: "10px", padding: "8px" }}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>}
        <button type="submit" style={{ padding: "10px 15px", cursor: "pointer", marginTop: "10px" }}>
          更新貼文
        </button>
      </form>
    </div>
  );
}
