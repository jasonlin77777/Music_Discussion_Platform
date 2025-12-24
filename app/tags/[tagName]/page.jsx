"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Chip, 
  IconButton,
  Grid,
  CircularProgress 
} from "@mui/material";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';

export default function TagPage() {
  const params = useParams();
  const tagName = params.tagName;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!tagName) return;
    const fetchPostsByTag = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tags/${tagName}`);
        const data = await res.json();
        const postsWithLikes = data.map(post => ({ ...post, likes: post.likes || [] }));
        setPosts(postsWithLikes);
      } catch (err) {
        console.error(`取得標籤 "${tagName}" 的貼文失敗`, err);
      }
      setLoading(false);
    };
    fetchPostsByTag();
  }, [tagName]);

  const handleLike = async (postId) => {
    if (!user) return alert("請先登入才能按讚！");
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setPosts(currentPosts => 
          currentPosts.map(p => 
            p.id === postId ? { ...p, likes: data.likes } : p
          )
        );
      } else {
        console.error("按讚失敗:", data.error);
      }
    } catch (err) {
      console.error("按讚時發生錯誤:", err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1">
          標籤: <Chip label={tagName} color="primary" />
        </Typography>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {posts.length === 0 ? (
            <Grid item xs={12}>
              <Typography>找不到任何包含此標籤的貼文。</Typography>
            </Grid>
          ) : (
            posts.map((post) => (
              <Grid item xs={12} key={post.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h5" component={Link} href={`/posts/${post.id}`} sx={{ mb: 1.5, textDecoration: 'none', color: 'inherit' }}>
                        {post.title}
                      </Typography>
                      <Chip label={post.category} size="small" />
                    </Box>
                    <Typography sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }} color="text.secondary">
                      作者：
                      <Button size="small" component={Link} href={`/profile/${post.user?.id}`} sx={{ p: 0, minWidth: 'auto', textTransform: 'none', ml: 0.5 }}>
                        {post.user?.name}
                      </Button>
                      <span style={{ margin: '0 8px' }}>·</span>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" sx={{
                      display: '-webkit-box',
                      overflow: 'hidden',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 3,
                    }}>
                      {post.content}
                    </Typography>
                  </CardContent>
                  <CardActions disableSpacing sx={{ justifyContent: 'space-between' }}>
                      <Box>
                          <IconButton aria-label="like post" onClick={() => handleLike(post.id)}>
                              {user && post.likes.includes(user.id) ? <ThumbUpIcon color="primary" /> : <ThumbUpOutlinedIcon />}
                          </IconButton>
                          <Typography variant="body2" component="span">
                              {post.likes.length}
                          </Typography>
                      </Box>
                    <Button size="small" component={Link} href={`/posts/${post.id}`}>
                      查看更多
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Container>
  );
}
