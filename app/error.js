"use client";

// Shown when a server render fails (e.g. the database is unreachable).
// Honest failure — no mock data fallback.
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
          background: "#faf8f4",
          color: "#201c17",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: "42ch" }}>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#6e675b", marginBottom: "1.25rem" }}>
            The portfolio could not be loaded right now. Please try again.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "#0e5a44",
              color: "#fff",
              border: 0,
              borderRadius: "9999px",
              padding: "0.75rem 1.5rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
