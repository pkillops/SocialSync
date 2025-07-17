# Twitter to Mastodon and Bluesky Crossposter (Visual AI Parser)

This project uses a GitHub Actions workflow to scrape the latest tweet from a Twitter profile using a visual AI parser and post it to Mastodon and Bluesky.

## Setup

1.  **Fork this repository.**

2.  **Create a Gemini API Key:** Go to [https://makersuite.google.com/](https://makersuite.google.com/) and create a new API key.

3.  **Add Secrets to your GitHub Repository:** In your repository settings, go to "Secrets and variables" > "Actions" and add the following secrets:

    *   `GEMINI_API_KEY`: Your Gemini API key.
    *   `MASTODON_INSTANCE`: The instance URL of your Mastodon account (e.g., `mastodon.social`).
    *   `MASTODON_ACCESS_TOKEN`: Your Mastodon access token.
    *   `BLUESKY_USERNAME`: Your Bluesky username.
    *   `BLUESKY_PASSWORD`: Your Bluesky app password.

4.  **Enable GitHub Actions:** If they are not already enabled, go to the "Actions" tab of your repository and enable them.

## How It Works

The GitHub Actions workflow runs on a schedule and is triggered every 15 minutes. It uses Puppeteer to take a screenshot of the specified Twitter profile and then uses the Gemini API to extract the text of the latest tweet. The tweet is then posted to Mastodon and Bluesky.

The workflow also commits the text of the last posted tweet to the `src/last_tweet.txt` file. This is used to prevent duplicate posts.
