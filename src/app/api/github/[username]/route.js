import { NextResponse } from 'next/server';

// ─── Server-side In-Memory Cache ────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) { cache.delete(key); return null; }
  return entry.data;
}
function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}
// ────────────────────────────────────────────────────────────────────────────

const GITHUB_GRAPHQL = 'https://api.github.com/graphql';
const GITHUB_REST    = 'https://api.github.com';
const FETCH_TIMEOUT  = 20_000; // 20 seconds — generous for cold starts

// ── Safe fetch with timeout (no Next.js cache options to avoid conflicts) ────
async function safeFetch(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    // Strip 'next' key before passing to fetch to avoid AbortController conflicts
    const { next: _next, ...fetchOptions } = options;
    const res = await fetch(url, { ...fetchOptions, signal: controller.signal });
    clearTimeout(timer);
    return { res, ok: res.ok };
  } catch (err) {
    clearTimeout(timer);
    return { res: null, ok: false, timedOut: err.name === 'AbortError', err };
  }
}

// ── GraphQL query (lean — only what the dashboard needs) ────────────────────
function buildGraphQLQuery(username) {
  const now   = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
  const todayEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

  return {
    query: `
      query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          name
          bio
          login
          avatarUrl
          url
          location
          company
          websiteUrl
          followers { totalCount }
          following  { totalCount }
          repositories(first: 1) { totalCount }
          contributionsCollection {
            totalCommitContributions
            totalPullRequestContributions
            totalIssueContributions
            totalRepositoriesWithContributedCommits
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                  color
                }
              }
            }
          }
          todayContributions: contributionsCollection(from: $from, to: $to) {
            totalCommitContributions
            commitContributionsByRepository {
              repository { name url primaryLanguage { name color } }
              contributions { totalCount }
            }
          }
          pinnedItems(first: 6, types: REPOSITORY) {
            nodes {
              ... on Repository {
                name description url stargazerCount forkCount updatedAt
                primaryLanguage { name color }
              }
            }
          }
          topRepositories(first: 12, orderBy: { field: STARGAZERS, direction: DESC }) {
            nodes {
              name description url stargazerCount forkCount updatedAt isFork
              primaryLanguage { name color }
            }
          }
        }
      }
    `,
    variables: { username, from: todayStart, to: todayEnd },
  };
}

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

  const pat = process.env.GITHUB_PAT;

  // Guard: GraphQL always needs a PAT
  if (!pat) {
    return NextResponse.json(
      { error: 'GitHub PAT is not configured. Add GITHUB_PAT to your .env.local file.' },
      { status: 503 }
    );
  }

  const restHeaders = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${pat}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const gqlHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${pat}`,
  };

  // ── Parallel fetch: GraphQL + REST repos ───────────────────────────────────
  const [gqlResult, reposResult] = await Promise.all([
    safeFetch(GITHUB_GRAPHQL, {
      method: 'POST',
      headers: gqlHeaders,
      body: JSON.stringify(buildGraphQLQuery(username)),
    }),
    safeFetch(`${GITHUB_REST}/users/${username}/repos?per_page=100&sort=updated`, {
      headers: restHeaders,
    }),
  ]);

  // ── Handle GraphQL result ──────────────────────────────────────────────────
  if (gqlResult.timedOut) {
    return NextResponse.json(
      { error: 'GitHub API timed out. Check your network or try again shortly.' },
      { status: 504 }
    );
  }

  if (!gqlResult.ok) {
    const status = gqlResult.res?.status;
    if (status === 401) {
      return NextResponse.json(
        { error: 'GitHub PAT is invalid or expired. Please regenerate it in GitHub Settings → Developer Settings.' },
        { status: 401 }
      );
    }
    if (status === 403) {
      return NextResponse.json(
        { error: 'GitHub PAT lacks required scopes. Ensure `read:user` and `repo` scopes are enabled.' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: `GitHub GraphQL API returned ${status || 'unknown error'}` },
      { status: 502 }
    );
  }

  let gqlJson;
  try {
    gqlJson = await gqlResult.res.json();
  } catch {
    return NextResponse.json({ error: 'Failed to parse GitHub GraphQL response.' }, { status: 502 });
  }

  if (gqlJson.errors) {
    const msg = gqlJson.errors[0]?.message || 'GitHub GraphQL error';
    // Could not resolve to a User with the login of '...'
    if (msg.toLowerCase().includes('could not resolve')) {
      return NextResponse.json({ error: `GitHub user "${username}" not found.` }, { status: 404 });
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // ── Compute language breakdown from REST repos ────────────────────────────
  let languages = [];
  if (reposResult.ok) {
    try {
      const reposJson = await reposResult.res.json();
      const langMap = {};
      if (Array.isArray(reposJson)) {
        reposJson.forEach((repo) => {
          if (repo.language) langMap[repo.language] = (langMap[repo.language] || 0) + 1;
        });
      }
      languages = Object.entries(langMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({ name, count }));
    } catch { /* ignore — languages are non-critical */ }
  }

  const payload = {
    user: gqlJson.data?.user || null,
    languages,
    fetchedAt: Date.now(),
  };

  setCache(cacheKey, payload);

  return NextResponse.json(payload, {
    headers: {
      'X-Cache': 'MISS',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
    },
  });
}
