"use client";
import { useState } from "react";

export default function PostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    const data = await res.json();
    setMsg(data.message || data.error);

    if (res.ok) {
      setTitle("");
      setContent("");
    }
  };

  return (
    <div>
      <h2>發表貼文</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="標題"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        /><br />
        <textarea
          placeholder="內容"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        /><br />
        <button>發文</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}
