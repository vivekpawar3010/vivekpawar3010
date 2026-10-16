import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import defaultFriends from '../../../../data/friends.json';

const FRIENDS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'friends.json');
const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';

// Server-side cache for friend stats to avoid hammering LeetCode
const statsCache = new Map();
const STATS_TTL_MS = 5 * 60 * 1000; // 5 minutes

function readFriends() {
  try {
    if (fs.existsSync(FRIENDS_FILE_PATH)) {
      const content = fs.readFileSync(FRIENDS_FILE_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading friends file:', err);
  }
  return defaultFriends;
}

function writeFriends(friends) {
  try {
    fs.writeFileSync(FRIENDS_FILE_PATH, JSON.stringify(friends, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing friends file:', err);
    return false;
  }
}

const STATS_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        realName
        userAvatar
        ranking
        reputation
      }
      submitStats {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
  }
`;

async function fetchUserStats(username, sessionCookie = '') {
  const cacheKey = username.toLowerCase();
  const cached = statsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < STATS_TTL_MS) {
    return cached.data;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  if (sessionCookie) {
    headers['Cookie'] = `LEETCODE_SESSION=${sessionCookie}`;
  }

  try {
    const res = await fetch(LEETCODE_GRAPHQL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: STATS_QUERY, variables: { username } }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    const matched = json.data?.matchedUser;
    if (!matched) return null;

    const acNums = matched.submitStats?.acSubmissionNum || [];
    const findCount = (diff) => {
      const entry = acNums.find((d) => d.difficulty.toLowerCase() === diff.toLowerCase());
      return entry ? entry.count : 0;
    };

    const stats = {
      username: matched.username,
      realName: matched.profile?.realName || matched.username,
      avatar: matched.profile?.userAvatar || '',
      ranking: matched.profile?.ranking || '--',
      reputation: matched.profile?.reputation || 0,
      totalSolved: findCount('all'),
      easySolved: findCount('easy'),
      mediumSolved: findCount('medium'),
      hardSolved: findCount('hard'),
    };

    statsCache.set(cacheKey, { data: stats, timestamp: Date.now() });
    return stats;
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionCookie = searchParams.get('session') || process.env.LEETCODE_SESSION || '';

  const friends = readFriends();

  // Concurrently fetch statistics for all friends
  const results = await Promise.all(
    friends.map(async (friend) => {
      const stats = await fetchUserStats(friend.username, sessionCookie);
      if (stats) {
        return {
          ...stats,
          name: friend.name || stats.realName,
          isUser: friend.isUser || friend.username.toLowerCase() === 'vivek_pawar-3010',
        };
      }
      return {
        username: friend.username,
        name: friend.name || friend.username,
        isUser: friend.isUser || false,
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        ranking: '--',
        avatar: '',
        fetchFailed: true,
      };
    })
  );

  // Sort by total solved descending
  results.sort((a, b) => b.totalSolved - a.totalSolved);

  // Assign leaderboard ranks
  const leaderboard = results.map((item, index) => ({
    ...item,
    leaderboardRank: index + 1,
  }));

  return NextResponse.json({
    leaderboard,
    sessionConfigured: Boolean(sessionCookie),
    sessionNote: sessionCookie
      ? 'LeetCode session cookie detected. Public and authenticated queries active.'
      : 'Using public LeetCode GraphQL statistics. LeetCode has no public friend-graph endpoint; tracking custom roster.',
    fetchedAt: Date.now(),
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const currentFriends = readFriends();

    if (body.action === 'add') {
      const username = body.username?.trim();
      if (!username) {
        return NextResponse.json({ error: 'Username is required' }, { status: 400 });
      }

      // Check if already in list
      if (currentFriends.some((f) => f.username.toLowerCase() === username.toLowerCase())) {
        return NextResponse.json({ error: 'User is already in your friends list' }, { status: 400 });
      }

      // Verify user exists on LeetCode
      const stats = await fetchUserStats(username);
      if (!stats) {
        return NextResponse.json(
          { error: `Could not verify LeetCode user "${username}". Make sure username is valid.` },
          { status: 404 }
        );
      }

      const newFriend = {
        username: stats.username,
        name: body.name?.trim() || stats.realName || stats.username,
        isUser: false,
      };

      const updated = [...currentFriends, newFriend];
      writeFriends(updated);

      return NextResponse.json({
        success: true,
        message: `Added ${stats.username} (${stats.totalSolved} solved questions)`,
        friend: { ...newFriend, ...stats },
      });
    }

    if (body.action === 'delete') {
      const username = body.username?.trim().toLowerCase();
      if (username === 'vivek_pawar-3010') {
        return NextResponse.json({ error: 'Cannot remove your own profile' }, { status: 400 });
      }

      const updated = currentFriends.filter((f) => f.username.toLowerCase() !== username);
      writeFriends(updated);
      return NextResponse.json({ success: true, message: 'Removed friend successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
