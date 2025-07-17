const { GoogleGenerativeAI } = require("@google/generative-ai");
const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const Mastodon = require("mastodon-api");
const axios = require("axios");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const twitterUrl = "https://twitter.com/neilhimself";

async function fetchLatestTweet() {
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto(twitterUrl, { waitUntil: "networkidle2" });
  const screenshot = await page.screenshot({ encoding: "base64" });
  await browser.close();
  return screenshot;
}

async function getTweetTextFromImage(screenshot) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  const prompt = "Extract the text of the latest tweet from this screenshot.";
  const image = {
    inlineData: {
      data: screenshot,
      mimeType: "image/png",
    },
  };
  const result = await model.generateContent([prompt, image]);
  const response = await result.response;
  const text = response.text();
  return text;
}

async function postToMastodon(text) {
  const M = new Mastodon({
    access_token: process.env.MASTODON_ACCESS_TOKEN,
    timeout_ms: 60 * 1000,
    api_url: `https://${process.env.MASTODON_INSTANCE}/api/v1/`,
  });

  const params = {
    status: text,
  };

  return new Promise((resolve, reject) => {
    M.post("statuses", params, (error, data) => {
      if (error) {
        console.error("Error posting to Mastodon:", error);
        reject(error);
      } else {
        console.log("Posted to Mastodon:", data.url);
        resolve(data);
      }
    });
  });
}

async function postToBluesky(text) {
  const loginResponse = await axios.post(
    "https://bsky.social/xrpc/com.atproto.server.createSession",
    {
      identifier: process.env.BLUESKY_USERNAME,
      password: process.env.BLUESKY_PASSWORD,
    }
  );

  const { accessJwt } = loginResponse.data;

  await axios.post(
    "https://bsky.social/xrpc/com.atproto.repo.createRecord",
    {
      repo: process.env.BLUESKY_USERNAME,
      collection: "app.bsky.feed.post",
      record: {
        text: text,
        createdAt: new Date().toISOString(),
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessJwt}`,
      },
    }
  );

  console.log("Posted to Bluesky");
}

async function main() {
  try {
    const lastTweet = await fs.readFile("src/last_tweet.txt", "utf-8");
    const screenshot = await fetchLatestTweet();
    const tweetText = await getTweetTextFromImage(screenshot);

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
