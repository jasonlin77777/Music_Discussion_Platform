"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert
} from "@mui/material";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [reportedPosts, setReportedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user === null) {
      // If user is not logged in, redirect
      router.push('/login');
      return;
    }
    
    // If user is logged in but not an admin, show access denied
    if (user && user.role !== 'admin') {
      setError("沒有權限存取此頁面");
      setLoading(false);
      return;
    }

    // If user is an admin, fetch reported posts
    if (user && user.role === 'admin') {
      const fetchReportedPosts = async () => {
        try {
          const res = await fetch('/api/admin/reported-posts');
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "無法取得被檢舉的貼文");
          }
          const data = await res.json();
          setReportedPosts(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchReportedPosts();
    }
  }, [user, router]);

  const handleDeletePost = async (postId) => {
    if (window.confirm("確定要以管理員身份刪除這篇貼文嗎？")) {
      try {
        const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
        if (res.ok) {
          // Remove post from local state to update UI
          setReportedPosts(prev => prev.filter(p => p.id !== postId));
        } else {
          const data = await res.json();
          alert(`刪除失敗: ${data.error}`);
        }
      } catch (err) {
        alert("刪除時發生錯誤");
      }
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Container><Alert severity="error" sx={{ mt: 4 }}>{error}</Alert></Container>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        管理員儀表板
      </Typography>
      <Typography variant="h6" component="h2" gutterBottom>
        被檢舉的貼文
      </Typography>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>標題</TableCell>
                <TableCell>作者</TableCell>
                <TableCell>建立時間</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportedPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    沒有被檢舉的貼文
                  </TableCell>
                </TableRow>
              ) : (
                reportedPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>{post.title}</TableCell>
                    <TableCell>{post.user?.name}</TableCell>
                    <TableCell>{new Date(post.createdAt).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Button component={Link} href={`/posts/${post.id}`} sx={{ mr: 1 }}>
                        查看
                      </Button>
                      <Button color="error" onClick={() => handleDeletePost(post.id)}>
                        刪除
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}
