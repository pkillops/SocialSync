# Twitter to Mastodon and Bluesky Crossposter (Scraping-as-a-Service)

This project uses a GitHub Actions workflow to scrape the latest tweet from a Twitter profile using ScrapingBee and post it to Mastodon and Bluesky.

## Setup

1.  **Fork this repository.**

2.  **Create a ScrapingBee API Key:** Go to [https://www.scrapingbee.com/](https://www.scrapingbee.com/) and create a free account to get an API key.

3.  **Add Secrets to your GitHub Repository:** In your repository settings, go to "Secrets and variables" > "Actions" and add the following secrets:

    *   `SCRAPINGBEE_API_KEY`: Your ScrapingBee API key.
    *   `MASTODON_INSTANCE`: The instance URL of your Mastodon account (e.g., `mastodon.social`).
    *   `MASTODON_ACCESS_TOKEN`: Your Mastodon access token.
    *   `BLUESKY_USERNAME`: Your Bluesky username.
    *   `BLUESKY_PASSWORD`: Your Bluesky app password.

4.  **Enable GitHub Actions:** If they are not already enabled, go to the "Actions" tab of your repository and enable them.

## How It Works

The GitHub Actions workflow runs on a schedule and is triggered every 15 minutes. It uses ScrapingBee to get the HTML of the specified Twitter profile and then uses Cheerio to extract the text of the latest tweet. The tweet is then posted to Mastodon and Bluesky.

The workflow also commits the text of the last posted tweet to the `src/last_tweet.txt` file. This is used to prevent duplicate posts.
