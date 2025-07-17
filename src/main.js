const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs").promises;
const { BskyAgent } = require("@atproto/api");
const fetch = require("node-fetch");

const twitterUrl = "https://twitter.com/neilhimself";

async function getLatestTweet() {
  const response = await axios.post(
    "https://app.scrapingbee.com/api/v1/",
    {
      api_key: process.env.SCRAPINGBEE_API_KEY,
      url: twitterUrl,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const $ = cheerio.load(response.data);
  const tweetText = $("article[data-testid='tweet']").first().text();
  return tweetText;
}

async function postToMastodon(text) {
  const response = await fetch(
    `https://${process.env.MASTODON_INSTANCE}/api/v1/statuses`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MASTODON_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ status: text }),
    }
  );

  const data = await response.json();
  console.log("Posted to Mastodon:", data.url);
}

async function postToBluesky(text) {
  const agent = new BskyAgent({ service: "https://bsky.social" });
  await agent.login({
    identifier: process.env.BLUESKY_USERNAME,
    password: process.env.BLUESKY_PASSWORD,
  });

  await agent.post({
    text: text,
  });

  console.log("Posted to Bluesky");
}

async function main() {
  try {
    const lastTweet = await fs.readFile("src/last_tweet.txt", "utf-8");
    const tweetText = await getLatestTweet();

    if (tweetText.trim() !== lastTweet.trim()) {
      await postToMastodon(tweetText);
      await postToBluesky(tweetText);
      await fs.writeFile("src/last_tweet.txt", tweetText);
    } else {
      console.log("No new tweet to post.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
