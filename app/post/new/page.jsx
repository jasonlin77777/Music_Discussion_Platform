"use client";
import { useState, useEffect } from "react";

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("搖滾");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) setUser(data.user);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage("請先登入才能發文！");
      return;
    }

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, category }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);

    if (data.post) {
      setTitle("");
      setContent("");
      setCategory("搖滾");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto" }}>
      <h2>✏️ 發表新貼文</h2>
      {!user && <p style={{ color: "red" }}>你尚未登入，無法發文</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="貼文標題"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />
        <textarea
          placeholder="貼文內容"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ width: "100%", marginBottom: "10px", padding: "8px", height: "150px" }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        >
          <option>搖滾</option>
          <option>歌劇</option>
          <option>古典樂</option>
          <option>KPOP</option>
          <option>JPOP</option>
          <option>國語歌</option>
          <option>台語歌</option>
          <option>英文歌</option>
        </select>
        <button style={{ padding: "8px 16px" }}>發文</button>
      </form>
      {message && <p style={{ marginTop: "10px", color: "green" }}>{message}</p>}
    </div>
  );
}
