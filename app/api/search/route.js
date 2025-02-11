// File: app/api/search/route.js
import { NextResponse } from 'next/server';

const API_KEY = process.env.SERPAPI_KEY;

export async function GET(request) {
  try {
    // Get the search query from URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Construct the SerpAPI URL
    const serpApiUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&api_key=${API_KEY}`;

    // Fetch data from SerpAPI
    const response = await fetch(serpApiUrl);
    const data = await response.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error },
        { status: 400 }
      );
    }

    // Return the shopping results
    return NextResponse.json(data);

  } catch (error) {
    console.error('SerpAPI error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    );
  }
}