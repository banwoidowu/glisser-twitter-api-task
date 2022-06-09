const { TwitterApi } = require("twitter-api-v2");
const redis = require("redis");
const {
  recordQuery,
  checkQueriesRunWithinLast15Minutes,
} = require("./dbFunctions");
const { CACHE_TIME } = require("../constants/constants");
require("dotenv").config();

const userClient = new TwitterApi({
  appKey: process.env.appKey,
  appSecret: process.env.appSecret,
  accessToken: process.env.accessToken,
  accessSecret: process.env.accessSecret,
});

const checkCache = async (client, hashtag) => {
  return await client.get(hashtag);
};

const cacheResults = async (client, hashtag, data) => {
  await client.setEx(hashtag, CACHE_TIME, JSON.stringify(data));
};

const getTweets = async (hashtag) => {
  const client = redis.createClient();
  await client.connect();
  const cachedResults = await checkCache(client, hashtag);

  if (cachedResults) {
    return JSON.parse(cachedResults);
  }

  await recordQuery(hashtag);
  const queryAmountCheck = await checkQueriesRunWithinLast15Minutes();

  if (queryAmountCheck) {
    return queryAmountCheck;
  }

  await userClient.appLogin();
  const v2Client = userClient.v2;
  const tweetsWithHashtag = await v2Client.get(
    `tweets/search/recent?query=%23${hashtag}&max_results=100`
  );
  //450 reqs per 15 min window

  if (tweetsWithHashtag?.data.length) {
    const tweetIds = tweetsWithHashtag?.data.map((el) => el.id);
    const enrichedTweetDetail = await Promise.all(
      tweetIds.map(async (id) => {
        return await v2Client.get(
          `tweets/${id}?expansions=author_id&user.fields=id,name,profile_image_url,created_at&tweet.fields=public_metrics`
        );
      })
    );
    //900 reqs per 15 min window
    await cacheResults(client, hashtag, enrichedTweetDetail);
    return enrichedTweetDetail;
  }

  return [];
};

module.exports = {
  getTweets,
};
