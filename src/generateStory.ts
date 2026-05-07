import { GoogleGenerativeAI } from "@google/generative-ai";

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

export async function generateStory(): Promise<{ theme: string; story: string; moral: string; vocabulary: Array<{word: string, meaning: string}> }> {
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

  const prompt = `Write a daily inspirational story about "${randomTheme}" targeted towards kids aged 10 to 15. 
  The story should be written in simple, easy-to-understand English, be engaging, uplifting, and under 400 words. 
  Include a clear "moral" of the story. 
  Also, intentionally use 2-3 slightly advanced English words in the story, and then provide a vocabulary list highlighting these new words and their meanings.
  
  Return the response strictly as a JSON object with the following schema:
  {
    "story": "The text of the story",
    "moral": "The moral lesson of the story",
    "vocabulary": [
      {
        "word": "word1",
        "meaning": "meaning of word1"
      }
    ]
  }`;

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
        vocabulary: parsed.vocabulary || []
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
