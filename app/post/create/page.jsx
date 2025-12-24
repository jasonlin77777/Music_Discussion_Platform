"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { 
  Container, 
  Paper, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  CircularProgress
} from "@mui/material";
import { detectMediaType, parseYouTubeUrl, parseSpotifyUrl } from "../../lib/mediaParser";
import { YouTubeEmbed, SpotifyEmbed } from "../../components/MediaEmbed";

export default function CreatePostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("搖滾");
  const [mediaUrl, setMediaUrl] = useState("");
  const [tags, setTags] = useState(""); // State for tags input
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const categories = ["搖滾", "古典", "KPOP", "JPOP", "國語歌", "台語歌", "英文歌"];

  if (!user) {
    if (typeof window !== 'undefined') {
        router.push("/login");
    }
    return <Typography sx={{ textAlign: 'center', mt: 4 }}>請先登入...</Typography>;
  }

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setUploading(true);

    let uploadedImageUrl = "";

    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('folder', 'post-images');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || '圖片上傳失敗');
        }
        uploadedImageUrl = uploadData.url;
      } catch (err) {
        setError(err.message);
        setUploading(false);
        return;
      }
    }

    try {
      // Process tags: split by comma, trim whitespace, remove empty strings
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

      const postData = {
        title,
        content,
        category,
        user,
        mediaUrl: mediaUrl.trim() || null,
        mediaType: detectMediaType(mediaUrl),
        imageUrl: uploadedImageUrl,
        tags: tagsArray, // Add tags array
      };
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        setMessage("發文成功！正在跳轉...");
        router.push("/");
      } else {
        setError(data.error || "發文失敗");
      }
    } catch (err) {
      console.error(err);
      setError("發文失敗，請稍後再試");
    } finally {
      setUploading(false);
    }
  };

  const renderMediaPreview = () => {
    if (imageUrl) {
      return <Box component="img" sx={{ mt: 2, maxHeight: 200, width: 'auto', borderRadius: 1 }} src={imageUrl} alt="圖片預覽"/>
    }
    if (!mediaUrl) return null;
    const mediaType = detectMediaType(mediaUrl);
    if (mediaType === 'youtube') {
      const videoId = parseYouTubeUrl(mediaUrl);
      return videoId ? <Box sx={{mt: 2}}><YouTubeEmbed videoId={videoId} /></Box> : <Alert severity="warning">無效的 YouTube 連結</Alert>;
    }
    if (mediaType === 'spotify') {
      const spotifyData = parseSpotifyUrl(mediaUrl);
      return spotifyData ? <Box sx={{mt: 2}}><SpotifyEmbed {...spotifyData} /></Box> : <Alert severity="warning">無效的 Spotify 連結</Alert>;
    }
    return <Alert severity="info">目前僅支援 YouTube 和 Spotify 連結</Alert>;
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          發表新貼文
        </Typography>
        <Box component="form" onSubmit={handlePostSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            label="標題"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            multiline
            rows={6}
            label="內容"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>分類</InputLabel>
            <Select
              value={category}
              label="分類"
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            fullWidth
            label="標籤 (以逗號分隔)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            label="YouTube 或 Spotify 連結 (選填)"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
          />
          <Button variant="outlined" component="label" sx={{ mt: 2 }}>
            上傳圖片 (選填)
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </Button>
          {renderMediaPreview()}
          {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{message}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={uploading}
          >
            {uploading ? <CircularProgress size={24} /> : '發佈貼文'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
