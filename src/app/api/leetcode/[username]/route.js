import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const username = resolvedParams?.username;

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  const query = `
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
      recentAcSubmissionList(username: $username, limit: 5) {
        title
        timestamp
        statusDisplay
        lang
      }
    }
  `;

  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { username } }),
      next: { revalidate: 60 } // Next.js cache optimization for 60 seconds
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from LeetCode" }, { status: 500 });
    }

    const data = await res.json();

    if (data.errors) {
      return NextResponse.json({ error: data.errors[0]?.message || "GraphQL Error" }, { status: 400 });
    }

    return NextResponse.json(data.data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
