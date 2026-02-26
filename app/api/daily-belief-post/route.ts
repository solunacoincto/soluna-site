import { kv } from '@vercel/kv';
import TwitterApi from 'twitter-api-v2';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1️⃣ Trigger belief calculation
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const beliefResponse = await fetch(`${baseUrl}/api/update-belief-v2`);
    const beliefData = await beliefResponse.json();
    const finalBelief = beliefData.result.belief;

    // 2️⃣ Save daily close belief to KV
    const dailyCloseKey = 'belief:dailyClose';
    await kv.set(dailyCloseKey, finalBelief.toString());

    // Get current UTC time for the post
    const now = new Date();
    const hours = now.getUTCHours().toString().padStart(2, '0');
    const minutes = now.getUTCMinutes().toString().padStart(2, '0');
    const currentTimeUTC = `${hours}:${minutes} UTC`;

    // 3️⃣ Prepare post content
    const postContent =
`Belief Index — Daily Close
${finalBelief}

Current Phase: ${beliefData.result.phase}

Automatically generated at ${currentTimeUTC}`;

    // 4️⃣ Initialize Twitter client
    const twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY as string,
      appSecret: process.env.TWITTER_API_SECRET as string,
      accessToken: process.env.TWITTER_ACCESS_TOKEN as string,
      accessSecret: process.env.TWITTER_ACCESS_SECRET as string,
    });

    const rwClient = twitterClient.readWrite;

    // 5️⃣ Post to X or log in dev
    if (process.env.NODE_ENV === 'production' || process.env.TEST_TWEET === 'true') {
      try {
        await rwClient.v2.tweet(postContent);
        console.log('Daily belief posted to X:', postContent);
      } catch (err: any) {
        console.error('Error posting to X:', err.message || err);
      }
    } else {
      // Development: only log the tweet
      console.log('--- DEV MODE ---');
      console.log('Tweet would be posted:\n', postContent);
      console.log('Daily belief posted to X (simulated).');
    }

    return NextResponse.json({
      status: 'success',
      dailyClose: finalBelief,
      post: postContent,
      env: process.env.NODE_ENV,
    });
  } catch (error: any) {
    console.error('Error in daily-belief-post:', error.message || error);
    return NextResponse.json({
      status: 'error',
      message: error.message || error,
    });
  }
}