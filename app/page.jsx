"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "./context/AuthContext";
import { 
  Container, 
  Typography, 
  TextField, 
  Select, 
  MenuItem, 
  Box, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Chip, 
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  CircularProgress
} from "@mui/material";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';

const PAGE_LIMIT = 5; // Number of posts per page

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("全部");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  const categories = ["全部", "搖滾", "古典", "KPOP", "JPOP", "國語歌", "台語歌", "英文歌"];

  const fetchPosts = useCallback(async (cursor) => {
    try {
      const url = cursor ? `/api/posts?limit=${PAGE_LIMIT}&cursor=${cursor}` : `/api/posts?limit=${PAGE_LIMIT}`;
      const res = await fetch(url);
      const data = await res.json();
      
      const postsWithLikes = data.posts.map(post => ({ ...post, likes: post.likes || [] }));
      
      setPosts(prev => cursor ? [...prev, ...postsWithLikes] : postsWithLikes);
      setNextCursor(data.nextCursor);
      setHasMore(data.nextCursor !== null);

    } catch (err) {
      console.error("取得貼文失敗", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPosts(null);
  }, [fetchPosts]);

  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) {
      setLoadingMore(true);
      fetchPosts(nextCursor);
    }
  };

  const handleLike = async (postId) => {
    if (!user) {
      alert("請先登入才能按讚！");
      return;
    }
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

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = filterCategory === "全部" || post.category === filterCategory;
    const matchesSearch =
      search === "" ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase()) ||
      (post.user && post.user.name.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          label="搜尋關鍵字..."
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel>分類</InputLabel>
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            label="分類"
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Typography variant="h4" component="h1" gutterBottom>
        最新貼文
      </Typography>
      
      {loading && posts.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {filteredPosts.length === 0 ? (
              <Grid item xs={12}>
                <Typography>沒有符合條件的貼文</Typography>
              </Grid>
            ) : (
              filteredPosts.map((post) => (
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
                                        <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                                          {post.tags?.map(tag => (
                                            <Chip key={tag} label={tag} size="small" component={Link} href={`/tags/${tag}`} clickable />
                                          ))}
                                        </Box>                      <Typography variant="body2" sx={{
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

          {hasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button 
                variant="contained" 
                onClick={handleLoadMore} 
                disabled={loadingMore}
              >
                {loadingMore ? <CircularProgress size={24} /> : '載入更多'}
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
