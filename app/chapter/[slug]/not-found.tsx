import Link from "next/link";

export default function ChapterNotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0D0B08",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <p
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.6rem",
          letterSpacing: "0.3em",
          color: "rgba(201,168,76,0.4)",
          textTransform: "uppercase",
          marginBottom: "1.5rem",
        }}
      >
        Chapter Not Found
      </p>
      <p
        style={{
          fontFamily: '"EB Garamond", Garamond, Georgia, serif',
          fontSize: "1.1rem",
          fontStyle: "italic",
          color: "rgba(245,230,200,0.4)",
          marginBottom: "2rem",
        }}
      >
        This page of the Archive has not been written yet.
      </p>
      <Link
        href="/"
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.6rem",
          letterSpacing: "0.2em",
          color: "#C9A84C",
          textDecoration: "none",
          border: "1px solid rgba(201,168,76,0.3)",
          padding: "0.5rem 1.2rem",
        }}
      >
        Return to the Archive
      </Link>
    </div>
  );
}
