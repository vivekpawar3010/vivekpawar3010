import { NextResponse } from 'next/server';

// ─── Server-side In-Memory Cache ────────────────────────────────────────────
// Survives across requests within the same server process.
// Each entry: { data: Object, timestamp: number }
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}
// ────────────────────────────────────────────────────────────────────────────

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';
const FETCH_TIMEOUT_MS = 10_000; // 10 seconds

const QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile { realName userAvatar ranking reputation }
      badges { id name hoverText icon }
      languageProblemCount { languageName problemsSolved }
      submitStats {
        acSubmissionNum { difficulty count }
      }
    }
    userContestRanking(username: $username) {
      rating
      globalRanking
      attendedContestsCount
    }
    recentAcSubmissionList(username: $username, limit: 20) {
      title
      timestamp
      statusDisplay
      lang
    }
  }
`;

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const username = resolvedParams?.username;

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const cacheKey = username.toLowerCase();

  // ── Cache HIT ──────────────────────────────────────────────────────────────
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        'X-Cache': 'HIT',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  }

  // ── Cache MISS — fetch from LeetCode ──────────────────────────────────────
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(LEETCODE_GRAPHQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: QUERY, variables: { username } }),
      signal: controller.signal,
      // ISR: Next.js will serve a stale response and revalidate in background
      next: { revalidate: 300 },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json(
        { error: `LeetCode API responded with status ${res.status}` },
        { status: 502 }
      );
    }

    const json = await res.json();

    if (json.errors) {
      return NextResponse.json(
        { error: json.errors[0]?.message || 'GraphQL error from LeetCode' },
        { status: 400 }
      );
    }

    const payload = json.data;

    // Store in server-side cache
    setCache(cacheKey, payload);

    return NextResponse.json(payload, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request to LeetCode timed out. Please try again.' },
        { status: 504 }
      );
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
