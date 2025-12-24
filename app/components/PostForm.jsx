"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { detectMediaType, parseYouTubeUrl, parseSpotifyUrl } from "@/lib/mediaParser";
import { YouTubeEmbed, SpotifyEmbed } from "./MediaEmbed";

export default function Navbar({ onNewPost }) {
  const [user, setUser] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("搖滾");
  const [mediaUrl, setMediaUrl] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const categories = ["搖滾", "古典", "KPOP", "JPOP", "國語歌", "台語歌", "英文歌"];

  // 取得使用者
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/session");
        const data = await res.json();
        setUser(data.user || null);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  // 預覽媒體
  const renderMediaPreview = () => {
    if (!mediaUrl) return null;

    const mediaType = detectMediaType(mediaUrl);
    
    if (mediaType === 'youtube') {
      const videoId = parseYouTubeUrl(mediaUrl);
      return videoId ? (
        <div style={{ marginTop: "10px", maxHeight: "200px", overflow: "hidden" }}>
          <p style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>預覽:</p>
          <div style={{ transform: "scale(0.8)", transformOrigin: "top left" }}>
            <YouTubeEmbed videoId={videoId} />
          </div>
        </div>
      ) : (
        <p style={{ color: "red", fontSize: "12px" }}>無效的 YouTube 連結</p>
      );
    }

    if (mediaType === 'spotify') {
      const spotifyData = parseSpotifyUrl(mediaUrl);
      return spotifyData ? (
        <div style={{ marginTop: "10px" }}>
          <p style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>預覽:</p>
          <div style={{ transform: "scale(0.8)", transformOrigin: "top left" }}>
            <SpotifyEmbed {...spotifyData} />
          </div>
        </div>
      ) : (
        <p style={{ color: "red", fontSize: "12px" }}>無效的 Spotify 連結</p>
      );
    }

    if (mediaUrl.trim()) {
      return <p style={{ color: "orange", fontSize: "12px" }}>目前僅支援 YouTube 和 Spotify 連結</p>;
    }

    return null;
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const postData = {
        title,
        content,
        category,
        user,
        mediaUrl: mediaUrl.trim() || null,
        mediaType: detectMediaType(mediaUrl)
      };

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      const data = await res.json();
      if (data.id) {
        window.location.reload();
        setTitle("");
        setContent("");
        setCategory("搖滾");
        setMediaUrl("");
        setMessage("發文成功！");
        setShowPostForm(false);
      } else {
        setMessage(data.error || "發文失敗");
      }
    } catch (err) {
      console.error(err);
      setMessage("發文失敗，請稍後再試");
    }
  };

  return (
    <nav
      style={{
        padding: "10px 20px",
        backgroundColor: "#333",
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {/* 左側導航 */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <Link href="/"><span style={{ cursor: "pointer", color: "#fff" }}>首頁</span></Link>
        {user && <Link href="/profile/edit"><span style={{ cursor: "pointer", color: "#fff" }}>修改個人資料</span></Link>}
      </div>

      {/* 右側區塊 */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
        {user && (
          <>
            <span>{user.name}</span>
            <button
              onClick={() => setShowPostForm(!showPostForm)}
              style={{ padding: "5px 10px", cursor: "pointer" }}
            >
              發文
            </button>
            {showPostForm && (
              <div style={{
                position: "absolute",
                top: "50px",
                right: "0",
                backgroundColor: "#fff",
                color: "#000",
                padding: "15px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                zIndex: 1000,
                width: "350px",
                maxHeight: "600px",
                overflowY: "auto"
              }}>
                <h4>發表新貼文</h4>
                <form onSubmit={handlePostSubmit} style={{ display: "flex", flexDirection: "column" }}>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="標題"
                    required
                    style={{ marginBottom: "10px", padding: "5px" }}
                  />
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="內容"
                    required
                    style={{ marginBottom: "10px", padding: "5px", minHeight: "60px" }}
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ marginBottom: "10px", padding: "5px" }}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="貼上 YouTube 或 Spotify 連結 (選填)"
                    style={{ marginBottom: "10px", padding: "5px" }}
                  />
                  {renderMediaPreview()}
                  <button type="submit" style={{ padding: "5px 10px", cursor: "pointer", marginTop: "10px" }}>發文</button>
                  {message && <p style={{ color: "green", marginTop: "10px", fontSize: "12px" }}>{message}</p>}
                </form>
              </div>
            )}
            <button
              onClick={handleLogout}
              style={{ backgroundColor: "#f00", color: "#fff", border: "none", padding: "5px 10px", cursor: "pointer" }}
            >
              登出
            </button>
          </>
        )}
        {!user && (
          <>
            <Link href="/login"><button style={{ padding: "5px 10px", cursor: "pointer" }}>登入</button></Link>
            <Link href="/register"><button style={{ padding: "5px 10px", cursor: "pointer" }}>註冊</button></Link>
          </>
        )}
      </div>
    </nav>
  );
}