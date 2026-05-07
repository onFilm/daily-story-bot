import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";

const THEMES = [
  "friendship and loyalty",
  "standing up to bullies",
  "discovering hidden talents",
  "overcoming fear of failure",
  "teamwork and cooperation",
  "empathy and kindness",
  "honesty and integrity",
  "taking responsibility",
  "digital balance and outdoor adventures",
  "self-acceptance and body positivity",
  "dealing with peer pressure",
  "resilience after a setback",
  "dealing with cyberbullying",
  "the value of hard work",
  "handling changing friendships",
  "navigating middle school drama",
  "the importance of listening",
  "discovering your passion",
  "forgiving a friend",
  "embracing your uniqueness",
  "the power of a positive attitude",
  "dealing with jealousy",
];

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateStory(yesterdayRiddle: string = "None", yesterdayAnswer: string = "None"): Promise<{ 
  theme: string; 
  story: string; 
  moral: string; 
  vocabulary: Array<{word: string, meaning: string}>;
  yesterday_puzzle: { question: string; answer: string; explanation: string };
  today_puzzle: { type: string; question: string };
  today_puzzle_answer: { answer: string; explanation: string };
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite-preview";
  const model = genAI.getGenerativeModel({ 
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];

  const promptTemplatePath = path.join(__dirname, "prompt.txt");
  const promptTemplate = fs.readFileSync(promptTemplatePath, "utf-8");
  
  // Replace the placeholders in the new prompt format
  let prompt = promptTemplate.replace("${randomTheme}", randomTheme);
  prompt = prompt.replace("${yesterdayRiddle}", yesterdayRiddle);
  prompt = prompt.replace("${yesterdayAnswer}", yesterdayAnswer);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Generating story for theme: "${randomTheme}" (Attempt ${attempt}/${MAX_RETRIES})...`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error("Empty response received from Gemini");
      }

      const parsed = JSON.parse(text);
      return { 
        theme: randomTheme, 
        story: parsed.story,
        moral: parsed.moral,
        vocabulary: parsed.vocabulary || [],
        yesterday_puzzle: parsed.yesterday_puzzle,
        today_puzzle: parsed.today_puzzle,
        today_puzzle_answer: parsed.today_puzzle_answer
      };
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === MAX_RETRIES) {
        throw new Error(`Failed to generate story after ${MAX_RETRIES} attempts.`);
      }
      await sleep(RETRY_DELAY_MS * attempt);
    }
  }
  throw new Error("Unexpected error in generateStory");
}
