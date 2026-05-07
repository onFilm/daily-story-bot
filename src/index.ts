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
    
    // 1. Generate Story
    const { theme, story, moral, vocabulary } = await generateStory();
    console.log("Story generated successfully.");
    
    // 2. Save to DB (stories.json)
    let stories = [];
    if (fs.existsSync(STORIES_FILE)) {
      const data = fs.readFileSync(STORIES_FILE, "utf-8");
      if (data.trim()) {
        stories = JSON.parse(data);
      }
    }
    
    const newEntry = {
      date: new Date().toISOString(),
      theme,
      story,
      moral,
      vocabulary
    };
    
    stories.push(newEntry);
    fs.writeFileSync(STORIES_FILE, JSON.stringify(stories, null, 2), "utf-8");
    console.log("Story saved to stories.json.");

    // 3. Set GitHub Actions Environment Variables
    if (process.env.GITHUB_ENV) {
      // Format the content for the email
      let emailContent = `${story.replace(/\n/g, '<br>')}<br><br>`;
      emailContent += `<strong>Moral:</strong> ${moral}<br><br>`;
      if (vocabulary && vocabulary.length > 0) {
        emailContent += `<strong>New Vocabulary:</strong><ul>`;
        for (const v of vocabulary) {
          emailContent += `<li><strong>${v.word}</strong>: ${v.meaning}</li>`;
        }
        emailContent += `</ul>`;
      }

      // Use EOF multiline syntax for the story content
      const eof = "EOF";
      fs.appendFileSync(process.env.GITHUB_ENV, `story<<${eof}\n${emailContent}\n${eof}\n`, "utf-8");
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
