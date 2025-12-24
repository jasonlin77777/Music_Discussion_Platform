"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getDocument, getPostsByUserId } from "@/app/lib/fsUtils";
import { 
  Container, 
  Paper, 
  Box, 
  Typography, 
  Avatar, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Chip,
  CircularProgress 
} from "@mui/material";

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id;
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch user data and user posts in parallel
        const [user, posts] = await Promise.all([
          getDocument("users", userId),
          getPostsByUserId(userId)
        ]);

        if (!user) {
          setError("找不到該使用者");
        } else {
          setProfileUser(user);
          // Sort posts by creation date, newest first
          posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setUserPosts(posts);
        }
      } catch (err) {
        console.error("讀取資料失敗:", err);
        setError("讀取資料時發生錯誤");
      }
      setLoading(false);
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>{error}</Typography>;
  }
  
  if (!profileUser) {
    return null; // Should not happen if error handling is correct
  }

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        <Avatar 
          src={profileUser.avatar} 
          alt={profileUser.name}
          sx={{ width: 100, height: 100, fontSize: '3rem' }}
        />
        <Box>
          <Typography variant="h4" component="h1">{profileUser.name}</Typography>
          <Typography variant="body1" color="text.secondary">{profileUser.bio || "這位使用者很低調，沒有留下任何簡介。"}</Typography>
        </Box>
      </Paper>

      <Typography variant="h5" component="h2" gutterBottom>
        {profileUser.name} 的貼文 ({userPosts.length})
      </Typography>

      <Grid container spacing={3}>
        {userPosts.length === 0 ? (
          <Grid item xs={12}>
            <Typography>這位使用者還沒有發表任何貼文。</Typography>
          </Grid>
        ) : (
          userPosts.map((post) => (
            <Grid item xs={12} key={post.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component={Link} href={`/posts/${post.id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                      {post.title}
                    </Typography>
                    <Chip label={post.category} size="small" />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5 }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" sx={{
                    display: '-webkit-box',
                    overflow: 'hidden',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                  }}>
                    {post.content}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button size="small" component={Link} href={`/posts/${post.id}`}>
                    查看更多
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}
