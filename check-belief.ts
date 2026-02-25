import 'dotenv/config';
import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? '';
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? '';

if (!redisUrl || !redisToken) {
  console.error('Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN environment variables.');
  // Do not exit the process
}

const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});

async function checkLastBelief() {
  try {
    const history = await redis.lrange('belief:dailyHistory', -30, -1);
    if (!history || history.length === 0) {
      console.log('No belief history found in Redis.');
      return;
    }
    console.log('Last 30 beliefs from Redis:');
    history.forEach((entry, index) => {
      console.log(`${index + 1}: ${entry}`);
    });
  } catch (error) {
    console.error('Error fetching last belief:', error);
  }
}

checkLastBelief();
