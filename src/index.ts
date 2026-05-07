import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { generateStory } from "./generateStory";

// Load environment variables for local testing
dotenv.config();

const STORIES_FILE = path.join(__dirname, "..", "stories.json");

async function main() {
  try {
    console.log("Starting Daily Story Bot...");
    const isTestMode = process.env.TEST_MODE === "true";

    // 1. Load existing stories to get context for the puzzle
    let stories: any[] = [];
    if (fs.existsSync(STORIES_FILE)) {
      const data = fs.readFileSync(STORIES_FILE, "utf-8");
      if (data.trim()) {
        stories = JSON.parse(data);
      }
    }

    const lastStory = stories[stories.length - 1];
    const yesterdayRiddle = lastStory?.today_puzzle?.question || "None";
    const yesterdayAnswer = lastStory?.today_puzzle_answer?.answer || "None";

    // 2. Generate Story
    const result = await generateStory(yesterdayRiddle, yesterdayAnswer);
    const { 
      theme, 
      story, 
      moral, 
      vocabulary, 
      yesterday_puzzle, 
      today_puzzle, 
      today_puzzle_answer 
    } = result;
    
    console.log("Story and puzzle generated successfully.");

    // 3. Save to DB (stories.json) if NOT in test mode
    if (!isTestMode) {
      const newEntry = {
        date: new Date().toISOString(),
        theme,
        story,
        moral,
        vocabulary,
        today_puzzle,
        today_puzzle_answer
      };

      stories.push(newEntry);
      fs.writeFileSync(STORIES_FILE, JSON.stringify(stories, null, 2), "utf-8");
      console.log("Story saved to stories.json.");
    } else {
      console.log("Test mode active: skipping stories.json update.");
    }

    // 4. Set GitHub Actions Environment Variables
    if (process.env.GITHUB_ENV) {
      const vocabHtml = vocabulary && vocabulary.length > 0
        ? `<div class="section">
             <h3>📚 New Vocabulary</h3>
             <ul class="vocab-list">
               ${vocabulary.map(v => `<li><strong>${v.word}</strong>: ${v.meaning}</li>`).join("")}
             </ul>
           </div>`
        : "";

      const yesterdayPuzzleHtml = yesterday_puzzle && yesterday_puzzle.answer !== "None"
        ? `<div class="section" style="background: #e8f5e9; border-left-color: #4caf50;">
             <h3>💡 Yesterday's Reveal</h3>
             <p><strong>The Answer:</strong> ${yesterday_puzzle.answer} 🎉</p>
             <p>${yesterday_puzzle.explanation}</p>
           </div>`
        : "";

      const todayPuzzleHtml = today_puzzle
        ? `<div class="section" style="background: #fff9c4; border-left-color: #fbc02d;">
             <h3>🧠 Today's Brain Teaser</h3>
             <p><strong>Type:</strong> ${today_puzzle.type.toUpperCase()}</p>
             <p>${today_puzzle.question}</p>
             <p style="font-size: 14px; color: #777; font-style: italic;">Wait for tomorrow's story to see the answer! 🕵️</p>
           </div>`
        : "";

      const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
  .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
  .header { text-align: center; border-bottom: 2px dashed #eee; padding-bottom: 15px; margin-bottom: 25px; }
  .header h1 { color: #ff6b6b; margin: 0; font-size: 24px; }
  .story-content { font-size: 16px; color: #444; margin-bottom: 30px; }
  .section { padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #4a90e2; background: #f0f7ff; }
  .section h3 { margin-top: 0; color: #2c3e50; font-size: 18px; }
  .moral-text { font-size: 16px; font-weight: bold; color: #27ae60; }
  .vocab-list { margin: 0; padding-left: 20px; }
  .vocab-list li { margin-bottom: 8px; }
  .footer { text-align: center; font-size: 12px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; }
  @media (max-width: 600px) {
    .container { margin: 10px; padding: 20px; }
    .header h1 { font-size: 20px; }
  }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Your Daily Story ✨</h1>
      <p style="color: #888; font-style: italic; margin: 5px 0 0 0;">Theme: ${theme}</p>
    </div>

    ${yesterdayPuzzleHtml}

    <div class="story-content">
      ${story.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}
    </div>

    <div class="section">
      <h3>🌟 The Moral</h3>
      <div class="moral-text">${moral}</div>
    </div>

    ${vocabHtml}

    ${todayPuzzleHtml}

    <div class="footer">
      Generated with ❤️ by Daily Story Bot - Created by Prajwal Acharya
    </div>
  </div>
</body>
</html>`;

      // Use EOF multiline syntax for the story content
      const eof = "EOF";
      fs.appendFileSync(process.env.GITHUB_ENV, `story<<${eof}\n${htmlTemplate}\n${eof}\n`, "utf-8");
      fs.appendFileSync(process.env.GITHUB_ENV, `theme=${theme}\n`, "utf-8");
      console.log("Set GITHUB_ENV variables.");
    }

    console.log("Daily Story Bot completed successfully.");

  } catch (error) {
    console.error("An error occurred during execution:");
    console.error(error);
    process.exit(1);
  }
}

// Execute main if run directly
if (require.main === module) {
  main();
}
