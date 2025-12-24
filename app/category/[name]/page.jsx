"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function CategoryPage() {
  const { name } = useParams();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.filter((post) => post.category.toLowerCase() === name.toLowerCase()));
      });
  }, [name]);

  return (
    <div style={{ maxWidth: "600px", margin: "30px auto" }}>
      <h2>🎧 類型：{name}</h2>
      {posts.length === 0 ? (
        <p>目前沒有貼文</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} style={{ borderBottom: "1px solid #ccc", padding: "10px 0" }}>
            <Link href={`/post/${post.id}`}>
              <h3>{post.title}</h3>
            </Link>
            <p>{post.content}</p>
            <small>作者：{post.author} | 類別：{post.category}</small>
          </div>
        ))
      )}
    </div>
  );
}
