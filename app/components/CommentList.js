"use client";
import styles from "../styles/CommentList.module.css";

export default function CommentList({ comments, postId }) {
  const reportComment = async (commentId) => {
    await fetch("/comments/report", { 
      method: "POST", 
      body: JSON.stringify({ postId, commentId }), 
      headers: { "Content-Type": "application/json" } 
    });
    alert("已檢舉留言");
  };

  return (
    <div className={styles.container}>
      {comments.map(c => (
        <div key={c.id} className={styles.comment}>
          <b>{c.author}:</b> {c.content}
          <button onClick={() => reportComment(c.id)} style={{ marginLeft: "10px" }}>檢舉</button>
        </div>
      ))}
    </div>
  );
}
