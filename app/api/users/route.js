let users = []; // 與 auth route 共用

export async function PUT(req) {
  const { userId, username, email, bio } = await req.json();
  const user = users.find(u => u.id === userId);
  if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

  user.username = username;
  user.email = email;
  user.bio = bio;
  return new Response(JSON.stringify(user));
}
