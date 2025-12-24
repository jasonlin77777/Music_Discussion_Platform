"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { YouTubeEmbed, SpotifyEmbed } from "../../components/MediaEmbed";
import { parseYouTubeUrl, parseSpotifyUrl } from "../../lib/mediaParser";
import { 
  Container, 
  Paper, 
  Box, 
  Typography, 
  Button, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  TextField, 
  IconButton,
  Chip,
  Stack,
  Alert
} from "@mui/material";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';
import FlagIcon from '@mui/icons-material/Flag';

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id;
  const [post, setPost] = useState(null);
  const { user } = useAuth();
  const [commentContent, setCommentContent] = useState("");
  const [message, setMessage] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        if (!res.ok) {
          router.push('/');
          return;
        }
        const data = await res.json();
        const postData = {
          ...data,
          comments: (data.comments || []).map(c => ({ ...c, likes: c.likes || [] }))
        };
        setPost(postData);
      } catch (err) {
        console.error(err);
      }
    };
    if (postId) {
      fetchPost();
    }
  }, [postId, router]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setMessage("請先登入");
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, content: commentContent }),
      });
      const data = await res.json();
      if (res.ok) {
        const newComment = { ...data, likes: [] };
        setPost({ ...post, comments: [...post.comments, newComment] });
        setCommentContent("");
        setMessage("留言成功！");
      } else {
        setMessage(data.error || "留言失敗");
      }
    } catch (err) {
      console.error(err);
      setMessage("留言失敗，請稍後再試");
    }
  };
  
  const handleCommentLike = async (commentId) => {
    if (!user) return alert("請先登入才能按讚！");
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}/like`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        const updatedComments = post.comments.map(c => 
          c.id === commentId ? { ...c, likes: data.likes } : c
        );
        setPost({ ...post, comments: updatedComments });
      } else {
        console.error("留言按讚失敗:", data.error);
      }
    } catch (err) {
      console.error("留言按讚時發生錯誤:", err);
    }
  };

  const handlePostDelete = async () => {
    if (!user || user.id !== post.user.id) return alert("沒有權限！");
    if (window.confirm("確定要刪除這篇貼文嗎？此操作無法復原。")) {
      try {
        const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
        if (res.ok) {
          alert("貼文已刪除");
          router.push('/');
        } else {
          const data = await res.json();
          alert(`刪除失敗: ${data.error}`);
        }
      } catch (err) {
        console.error("刪除貼文時發生錯誤:", err);
        alert("刪除失敗，請稍後再試");
      }
    }
  };

  const handleReportPost = async () => {
    if (!user) return alert("請先登入才能檢舉！");
    if (window.confirm("確定要檢舉這篇貼文嗎？")) {
      try {
        const res = await fetch(`/api/posts/report`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId })
        });
        if (res.ok) {
          alert("貼文已檢舉，感謝您的回報！");
        } else {
          const data = await res.json();
          alert(`檢舉失敗: ${data.error}`);
        }
      } catch (err) {
        console.error("檢舉貼文時發生錯誤:", err);
        alert("檢舉失敗，請稍後再試");
      }
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!user) return;
    if (window.confirm("確定要刪除這則留言嗎？")) {
      try {
        const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
        if (res.ok) {
          const updatedComments = post.comments.filter(c => c.id !== commentId);
          setPost({ ...post, comments: updatedComments });
        } else {
          const data = await res.json();
          alert(`刪除失敗: ${data.error}`);
        }
      } catch (err) {
        console.error("刪除留言時發生錯誤:", err);
        alert("刪除失敗，請稍後再試");
      }
    }
  };

  const handleCommentEdit = async (commentId) => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingCommentContent }),
      });
      if (res.ok) {
        const { comment: updatedComment } = await res.json();
        const updatedComments = post.comments.map(c =>
          c.id === commentId ? { ...c, ...updatedComment } : c
        );
        setPost({ ...post, comments: updatedComments });
        setEditingCommentId(null);
        setEditingCommentContent("");
      } else {
        const data = await res.json();
        alert(`更新失敗: ${data.error}`);
      }
    } catch (err) {
      alert('更新失敗，請稍後再試');
    }
  };

  const handleReportComment = async (commentId) => {
    if (!user) return alert("請先登入才能檢舉留言！");
    if (window.confirm("確定要檢舉這則留言嗎？")) {
      try {
        const res = await fetch(`/comments/report`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId, commentId })
        });
        if (res.ok) {
          alert("留言已檢舉，感謝您的回報！");
        } else {
          const data = await res.json();
          alert(`檢舉失敗: ${data.error}`);
        }
      } catch (err) {
        console.error("檢舉留言時發生錯誤:", err);
        alert("檢舉失敗，請稍後再試");
      }
    }
  };

  const renderMedia = () => {
    // Prioritize showing uploaded image
    if (post.imageUrl) {
      return (
        <Box sx={{ my: 2 }}>
          <img src={post.imageUrl} alt={post.title} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
        </Box>
      );
    }
    if (!post.mediaUrl) return null;
    const type = post.mediaType || detectMediaType(post.mediaUrl);
    if (type === 'youtube') {
      const videoId = parseYouTubeUrl(post.mediaUrl);
      return videoId ? <Box sx={{ my: 2 }}><YouTubeEmbed videoId={videoId} /></Box> : null;
    }
    if (type === 'spotify') {
      const spotifyData = parseSpotifyUrl(post.mediaUrl);
      return spotifyData ? <Box sx={{ my: 2 }}><SpotifyEmbed {...spotifyData} /></Box> : null;
    }
    return null;
  };

  if (!post) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Chip label={post.category || "未知"} size="small" />
            <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 1 }}>
              {post.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
              作者：
              <Button size="small" component={Link} href={`/profile/${post.user?.id}`} sx={{ p: 0, minWidth: 'auto', textTransform: 'none', ml: 0.5 }}>
                {post.user?.name || "匿名"}
              </Button>
              <span style={{ margin: '0 8px' }}>·</span>
              {post.createdAt ? new Date(post.createdAt).toLocaleString('zh-TW') : ""}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
                {post.tags?.map(tag => (
                    <Chip key={tag} label={`#${tag}`} size="small" component={Link} href={`/tags/${tag}`} clickable />
                ))}
            </Box>
          </Box>
          {user && post.user && user.id === post.user.id && (
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" size="small" component={Link} href={`/posts/${post.id}/edit`}>編輯</Button>
              <Button variant="outlined" size="small" color="error" onClick={handlePostDelete}>刪除</Button>
            </Stack>
          )}
          {user && post.user && user.id !== post.user.id && (
              <Button variant="outlined" size="small" color="warning" onClick={handleReportPost}>
                檢舉
              </Button>
          )}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
          {post.content}
        </Typography>
        {renderMedia()}
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          留言 ({post.comments?.length || 0})
        </Typography>
        <List sx={{ bgcolor: 'background.paper' }}>
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((c, index) => (
              <Box key={c.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Link href={`/profile/${c.user?.id}`} passHref>
                      <Avatar alt={c.user?.name || 'A'} src={c.user?.avatar} sx={{ cursor: 'pointer' }} />
                    </Link>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography component={Link} href={`/profile/${c.user?.id}`} sx={{ fontWeight: 'bold', textDecoration: 'none', color: 'text.primary' }}>
                        {c.user?.name || "匿名"}
                      </Typography>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                    secondary={
                      <>
                        {editingCommentId === c.id ? (
                          <Box sx={{ mt: 1 }}>
                            <TextField
                              fullWidth
                              multiline
                              value={editingCommentContent}
                              onChange={(e) => setEditingCommentContent(e.target.value)}
                            />
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                              <Button size="small" variant="contained" onClick={() => handleCommentEdit(c.id)}>儲存</Button>
                              <Button size="small" variant="outlined" onClick={() => setEditingCommentId(null)}>取消</Button>
                            </Stack>
                          </Box>
                        ) : (
                          <Typography component="div" variant="body2" color="text.primary">
                            {c.content}
                          </Typography>
                        )}
                        <Typography component="div" variant="caption" sx={{ display: 'block', mt: 1 }}>
                          {c.createdAt ? new Date(c.createdAt).toLocaleString('zh-TW') : ""}
                        </Typography>
                      </>
                    }
                  />
                  <Stack direction="row" alignItems="center">
                    <IconButton size="small" onClick={() => handleCommentLike(c.id)}>
                      {user && c.likes.includes(user.id) ? <ThumbUpIcon fontSize="small" color="primary"/> : <ThumbUpOutlinedIcon fontSize="small" />}
                    </IconButton>
                    <Typography variant="body2">{c.likes.length}</Typography>
                    {user && c.user && user.id === c.user.id && (
                      <>
                        <IconButton size="small" onClick={() => { setEditingCommentId(c.id); setEditingCommentContent(c.content); }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleCommentDelete(c.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                    {user && c.user && user.id !== c.user.id && (
                      <IconButton size="small" onClick={() => handleReportComment(c.id)}>
                        <FlagIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                </ListItem>
                {/* {index < post.comments.length - 1 && <Divider component="li" />} */}
              </Box>
            ))
          ) : (
            <Typography sx={{ p: 2, color: "text.secondary" }}>尚無留言，成為第一個留言的人吧！</Typography>
          )}
        </List>
      </Box>

      {user && (
        <Paper elevation={2} sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom>新增留言</Typography>
          <Box component="form" onSubmit={handleCommentSubmit}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="輸入留言..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              送出留言
            </Button>
          </Box>
        </Paper>
      )}
      {!user && (
        <Alert severity="info" sx={{ mt: 4 }}>請先登入才能留言</Alert>
      )}
      {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
    </Container>
  );
}