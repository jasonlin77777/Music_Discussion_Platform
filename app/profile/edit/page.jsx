"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Container, Paper, Box, Typography, TextField, Button, Alert, Avatar, CircularProgress } from '@mui/material';

export default function EditProfilePage() {
  const { user, login } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
    } else {
      // If user is not loaded yet, redirect to login after a short delay
      const timer = setTimeout(() => {
        if (!user) {
          router.push('/login');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setNewAvatarFile(e.target.files[0]);
      // Show a preview of the new avatar
      setAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setUploading(true);

    let uploadedAvatarUrl = user.avatar;

    // Step 1: Upload new avatar if one is selected
    if (newAvatarFile) {
      try {
        const formData = new FormData();
        formData.append('file', newAvatarFile);
        formData.append('folder', 'avatars');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || '頭像上傳失敗');
        }
        uploadedAvatarUrl = uploadData.url;
      } catch (err) {
        setError(err.message);
        setUploading(false);
        return;
      }
    }

    // Step 2: Update user profile with new data
    try {
      const res = await fetch(`/api/user/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio, avatar: uploadedAvatarUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '個人資料更新失敗');
      }

      // Update the user in the global AuthContext
      login(data.user);
      setMessage('個人資料更新成功！');

    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>正在載入使用者資料...</Typography>
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Typography component="h1" variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
          修改個人資料
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Avatar src={avatar} alt={name} sx={{ width: 120, height: 120, mb: 2 }}/>
            <Button variant="outlined" component="label">
              更換頭像
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>
          </Box>
          <TextField
            margin="normal"
            required
            fullWidth
            label="名稱"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            multiline
            rows={4}
            label="個人簡介"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{message}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={uploading}
          >
            {uploading ? <CircularProgress size={24} /> : '儲存變更'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}