import Link from "next/link";
import profile from "../data/profile";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>{profile.name}</h1>
      <p>Welcome to my portfolio. Explore my projects and coding stats.</p>
      <Link href="/about" style={{ margin: "14px 0", display: "inline-block" }}>
        <button style={{ padding: "0.8rem 1.2rem", borderRadius: "0.55rem", border: "none", background: "#2563eb", color: "white" }}>
          View LeetCode Dashboard
        </button>
      </Link>
    </main>
  );
}

