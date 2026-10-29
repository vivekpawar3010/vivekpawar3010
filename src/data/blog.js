export const blogPosts = [
  {
    id: "how-i-built-pandharpurdarshan",
    title: "How I Built PandharpurDarshan with Next.js and Gemini API",
    slug: "how-i-built-pandharpurdarshan",
    excerpt: "Architecting a multi-lingual, AI-powered smart pilgrimage and tourism guide serving thousands of visitors with real-time temple queue estimations.",
    date: "12 Sep 2025",
    readTime: "5 min read",
    category: "Web Development",
    tags: ["Next.js", "Gemini API", "Sanity CMS", "React", "AI Integration"],
    thumbnail: "🏛️",
    content: `### Why PandharpurDarshan?
Pandharpur is visited by millions of pilgrims every year during the Vitthal Vari festival. However, devotees frequently face uncertainty regarding darshan line status, accommodation availability, and temple schedules.

### The Architecture
1. **Frontend**: Built with Next.js App Router for server-side rendering, sub-second initial loads, and SEO optimization.
2. **AI Assistance**: Integrated Google's Gemini API to power an automated multi-lingual concierge capable of answering queries in Marathi, Hindi, and English.
3. **Content Management**: Connected with Sanity CMS for fast updates to temple timings and local accommodation listings without requiring code rebuilds.

### Results & Learnings
- Achieved sub-200ms page delivery with edge caching.
- Handled thousands of concurrent requests during festive surges without downtime.`,
  },
  {
    id: "my-journey-to-500-leetcode-problems",
    title: "My Journey to 500 LeetCode Problems Solved",
    slug: "my-journey-to-500-leetcode-problems",
    excerpt: "The patterns, discipline, and daily habits that transformed competitive programming from intimidating math into an intuitive engineering muscle.",
    date: "5 Aug 2025",
    readTime: "7 min read",
    category: "Career & DSA",
    tags: ["DSA", "LeetCode", "Java", "Algorithms", "Problem Solving"],
    thumbnail: "⚡",
    content: `### The Rock Lee Mindset: Hard Work Over innate Genius
When I first started solving DSA questions, even basic Two Pointers and Hash Map problems felt overwhelming. Adopting a strict discipline of 2-3 problems daily changed everything.

### Core Patterns Mastered:
1. **Sliding Window (Variable & Fixed)**: Crucial for subarray and substring optimization in O(N).
2. **Monotonic Stack**: Unlocks Next Greater Element problems in linear time.
3. **Graph Traversals (BFS/DFS & Dijkstra)**: Key to solving shortest path and network routing questions.
4. **Dynamic Programming**: Moving from top-down recursion with memoization to space-optimized bottom-up tabular arrays.

### Key Advice:
Consistency beats intensity. Solving 2 problems with thorough pattern analysis every single day yields vastly greater understanding than solving 20 problems once a week.`,
  },
  {
    id: "studybuddy-features-and-tech-stack",
    title: "StudyBuddy — AI Study Management & Mock Test Platform",
    slug: "studybuddy-features-and-tech-stack",
    excerpt: "Deep-dive into StudyBuddy's architecture: combining FastAPI asynchronous workers, Next.js UI, and Firebase Auth for intelligent student study workflows.",
    date: "20 Jul 2025",
    readTime: "6 min read",
    category: "AI/ML",
    tags: ["FastAPI", "Next.js", "Firebase", "Python", "Full Stack"],
    thumbnail: "📚",
    content: `### Problem Statement
Students waste immense hours consolidating lecture notes and searching for relevant practice questions. StudyBuddy automates revision workflows using LLM-driven concept extraction.

### Tech Stack Choices
- **Next.js & React**: Fluid student dashboard with instant state updates and mock test timers.
- **FastAPI (Python)**: High-throughput async endpoints communicating with AI reasoning models.
- **Firebase Authentication & Firestore**: Secure user sessions and fast test result history caching.

### Key Features
- **Automatic Note Summarizer**: Condenses 20-page PDF chapters into actionable bullet sheets.
- **Dynamic Quiz Generator**: Generates 10 customizable multiple-choice questions from lecture transcripts with explanations.`,
  },
  {
    id: "system-design-caching-redis",
    title: "System Design Essentials: Caching Strategies & Redis In-Memory Patterns",
    slug: "system-design-caching-redis",
    excerpt: "When and how to implement Cache-Aside, Write-Through, and Write-Back caching in scalable modern web systems.",
    date: "15 Oct 2025",
    readTime: "8 min read",
    category: "System Design",
    tags: ["Redis", "System Design", "Backend", "PostgreSQL", "Scalability"],
    thumbnail: "⚙️",
    content: `### Why Caching Matters
Database disk I/O is usually the primary bottleneck in high-scale systems. Using an in-memory datastore like Redis delivers sub-millisecond retrieval for 95% of read queries.

### Patterns Explored
1. **Cache-Aside (Lazy Loading)**: The application checks Redis first. On cache miss, it reads PostgreSQL, populates Redis with a TTL, and returns the result.
2. **Cache Invalidation**: How to handle stale data using Time-To-Live (TTL) and event-driven invalidation.
3. **Combating Thundering Herd & Cache Stampede**: Using distributed locks (Redlock) or probabilistic early expiration.`,
  },
];

export default blogPosts;
