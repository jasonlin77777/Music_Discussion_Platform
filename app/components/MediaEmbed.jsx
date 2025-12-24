export function YouTubeEmbed({ videoId }) {
  return (
    <div style={{ 
      position: "relative", 
      width: "100%", 
      paddingBottom: "56.25%",
      marginTop: "15px",
      marginBottom: "15px"
    }}>
      <iframe
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          borderRadius: "8px",
          border: "none"
        }}
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export function SpotifyEmbed({ type, id }) {
  const height = type === 'track' ? '152' : '380';
  
  return (
    <div style={{ marginTop: "15px", marginBottom: "15px" }}>
      <iframe
        style={{
          borderRadius: "8px",
          width: "100%",
          border: "none"
        }}
        src={`https://open.spotify.com/embed/${type}/${id}`}
        height={height}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </div>
  );
}