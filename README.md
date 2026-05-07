# Daily Story Bot

A GitHub Actions based automation system that generates a daily inspirational story using Google's Gemini API and sends it via email.

## Features
- **Kids-Focused AI Stories:** Uses Google's Gemini 3.1 Flash Lite model to create highly engaging, funny, and uplifting stories targeted at kids aged 6-12.
- **Rich Structured Data:** Automatically extracts the story, a clear moral lesson, and an age-appropriate vocabulary list (with meanings) using strict JSON parsing.
- **Emoji Support:** Stories and morals are sprinkled with fun emojis to keep children entertained.
- **Dynamic Themes:** Rotates between 22 child-friendly themes like "discovering your passion", "teamwork and cooperation", "standing up to bullies", etc.
- **Beautiful HTML Emails:** Formats the generated content into a beautifully styled, responsive HTML email with a dedicated moral section and vocabulary list.
- **Automated Delivery & Storage:** Commits the raw JSON data to a local `stories.json` file for your database, and automatically emails the formatted story daily via GitHub Actions.
- **Robust Architecture:** Implements a built-in retry mechanism to gracefully handle temporary API rate limits or outages (e.g., 503 errors).

## Architecture Overview
- `src/generateStory.ts`: Interacts with the Gemini API using structured JSON schemas to craft the daily story, extract the moral, and build the vocabulary list.
- `src/index.ts`: The main entry point that orchestrates generation, saves the structured data to `stories.json`, and crafts the responsive HTML email for GitHub Actions.
- `.github/workflows/daily-story.yml`: Configures the daily cron job (07:00 UTC), commits `stories.json` to the repo, and sends the email using `dawidd6/action-send-mail@v2`.

## Local Setup

### Prerequisites
- Node.js (v18+)
- A Google Gemini API Key (Get one from [Google AI Studio](https://aistudio.google.com/))

### 1. Installation
Run the setup script to initialize the project and install dependencies:
```bash
npm install
cp .env.example .env
```

### 2. Environment Variables
Edit the `.env` file with your credentials:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.1-flash-lite-preview
```

### 3. Run Locally
Test the bot locally by running:
```bash
npm start
```
This runs the script using `ts-node` and will append a new entry to `stories.json`.

## GitHub Actions Deployment

To automate the daily execution, fork or push this repository to GitHub, then set up the required secrets.

### GitHub Secrets Setup
To send emails securely via Gmail, you need an App Password:
1. Go to your Google Account -> Security.
2. Enable 2-Step Verification if not already enabled.
3. Search for "App Passwords" in the search bar.
4. Create a new App Password for "Mail".

Go to your GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions** and add:
- **Secrets:**
  - `GEMINI_API_KEY`: Your Google Gemini API Key
  - `EMAIL_USERNAME`: Your Gmail address
  - `EMAIL_PASSWORD`: Your 16-character Gmail App Password
- **Variables:**
  - `GEMINI_MODEL`: (Optional) `gemini-3.1-flash-lite-preview`

Once secrets are set, the bot will run automatically every day at 07:00 UTC.
You can also manually trigger it by going to the **Actions** tab -> **Daily Story Bot** -> **Run workflow**.

## Troubleshooting
- **Email not sending locally:** Ensure your Gmail App Password is correct. Regular account passwords will not work for SMTP.
- **Gemini API Error:** Verify your API key is valid and has not exceeded quotas. The built-in retry mechanism will handle temporary network glitches.
- **GitHub Action Failing:** Check the workflow logs. Ensure all 4 secrets are correctly spelled and saved in the repository settings.
