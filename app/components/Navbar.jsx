"use client";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { AppBar, Toolbar, Typography, Button, Box, CircularProgress } from "@mui/material";

export default function Navbar() {
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Left side */}
        <Typography variant="h6" component={Link} href="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
          MDP 音樂論壇
        </Typography>

        {/* Right side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : user ? (
            <>
              <Typography variant="subtitle1">
                {user.name}
              </Typography>
              <Button color="inherit" component={Link} href="/post/create">
                發文
              </Button>
              <Button color="inherit" component={Link} href="/profile/edit">
                修改個人資料
              </Button>
              {user.role === 'admin' && (
                <Button color="inherit" component={Link} href="/admin">
                  管理員
                </Button>
              )}
              <Button color="inherit" onClick={handleLogout}>
                登出
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} href="/login">
                登入
              </Button>
              <Button color="inherit" component={Link} href="/register">
                註冊
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}