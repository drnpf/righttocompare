import { ISentimentTag, ISentimentSummary } from "src/models/Sentiment";

// Topic keywords grouped by phone spec category
const TOPIC_KEYWORDS: Record<string, string[]> = {
  camera: [
    "camera",
    "photo",
    "photos",
    "picture",
    "pictures",
    "selfie",
    "selfies",
    "lens",
    "zoom",
    "portrait",
    "night mode",
    "video recording",
    "megapixel",
    "ultra wide",
    "telephoto",
    "ois",
    "hdr",
  ],
  battery: [
    "battery",
    "battery life",
    "charge",
    "charging",
    "mah",
    "power",
    "drain",
    "dies",
    "lasts",
    "wireless charging",
    "fast charging",
  ],
  performance: [
    "performance",
    "speed",
    "fast",
    "slow",
    "lag",
    "laggy",
    "smooth",
    "processor",
    "chip",
    "ram",
    "snappy",
    "responsive",
    "crash",
    "crashes",
    "freeze",
    "freezes",
    "multitask",
    "gaming",
  ],
  display: [
    "display",
    "screen",
    "brightness",
    "resolution",
    "refresh rate",
    "amoled",
    "oled",
    "lcd",
    "120hz",
    "90hz",
    "color",
    "colours",
    "vivid",
    "dim",
    "readable",
  ],
  design: [
    "design",
    "build",
    "weight",
    "heavy",
    "light",
    "thin",
    "thick",
    "premium",
    "cheap",
    "plastic",
    "glass",
    "titanium",
    "aluminum",
    "grip",
    "slippery",
    "color",
    "colors",
  ],
  value: [
    "value",
    "price",
    "expensive",
    "cheap",
    "worth",
    "overpriced",
    "affordable",
    "budget",
    "money",
    "cost",
    "bang for buck",
  ],
  software: [
    "software",
    "update",
    "updates",
    "os",
    "android",
    "ios",
    "ui",
    "bloatware",
    "clean",
    "buggy",
    "bugs",
    "feature",
    "features",
  ],
  audio: [
    "audio",
    "speaker",
    "speakers",
    "sound",
    "loud",
    "quiet",
    "headphone",
    "dolby",
    "stereo",
    "mono",
    "call quality",
  ],
  community: [
    "shipping",
    "delivery",
    "pre-order",
    "order",
    "tracking",
    "delivered",
    "availability",
    "stock",
    "backorder",
    "warehouse",
  ],
  connectivity: ["5g", "wifi", "reception", "signal", "bluetooth", "hotspot", "remote", "antenna"],
  security: ["face id", "fingerprint", "biometric", "privacy", "encryption", "secure", "knox", "vault"],
  gaming: ["fps", "thermal", "heat", "overheating", "throttling", "gpu", "cooling", "refresh rate"],
  updates: ["beta", "firmware", "patch", "security update", "one ui", "ios version", "download", "installing"],
  support: ["warranty", "repair", "customer service", "support", "rma", "refurbished", "replacement"],
};

// Positive and negative signal words
const POSITIVE_SIGNALS = [
  "great",
  "good",
  "excellent",
  "amazing",
  "awesome",
  "fantastic",
  "love",
  "loved",
  "best",
  "impressive",
  "beautiful",
  "solid",
  "smooth",
  "crisp",
  "sharp",
  "bright",
  "fast",
  "quick",
  "reliable",
  "stunning",
  "superb",
  "perfect",
  "wonderful",
  "outstanding",
  "premium",
  "worth",
  "recommend",
  "enjoy",
  "pleased",
  "happy",
  "satisfied",
  "incredible",
  "phenomenal",
  "brilliant",
  "clean",
  "snappy",
  "vivid",
  "comfortable",
  "durable",
  "clutch",
  "beast",
  "fire",
  "goat",
  "goated",
  "daily driver",
  "no-brainer",
];

const NEGATIVE_SIGNALS = [
  "bad",
  "poor",
  "terrible",
  "awful",
  "worst",
  "hate",
  "hated",
  "slow",
  "laggy",
  "lag",
  "disappointing",
  "disappointed",
  "mediocre",
  "cheap",
  "flimsy",
  "dim",
  "blurry",
  "grainy",
  "overpriced",
  "expensive",
  "drain",
  "dies",
  "heavy",
  "bulky",
  "uncomfortable",
  "fragile",
  "crash",
  "crashes",
  "freeze",
  "freezes",
  "buggy",
  "bugs",
  "bloat",
  "bloatware",
  "unreliable",
  "frustrating",
  "annoying",
  "struggle",
  "lacking",
  "weak",
  "subpar",
  "underwhelming",
  "regret",
  "avoid",
  "trash",
  "garbage",
  "mid",
  "dealbreaker",
  "skip",
  "littered with",
];

const NEGATORS = ["not", "no", "isnt", "wasnt", "arent", "cannot", "hardly", "barely", "lacks", "neither"];

const QUESTION_STARTERS = [
  "is",
  "how",
  "why",
  "can",
  "does",
  "anybody",
  "anyone",
  "what",
  "should",
  "will",
  "are",
  "has",
  "who",
];

/**
 * Analyzes text and returns sentiment tags for detected topics.
 */
export function analyzeSentiment(text: string): ISentimentTag[] {
  const lowerText = text.toLowerCase();
  const tags: ISentimentTag[] = [];

  // Split text into clauses for more accurate per-topic sentiment
  const clauses = lowerText
    .split(/[.!?\n]+| but | however | although | whereas | while | though /)
    .filter((s) => s.trim().length > 5);

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    // Find clause that mention this topic
    const relevantClauses = clauses.filter((clauses) => keywords.some((kw) => clauses.includes(kw)));

    if (relevantClauses.length === 0) continue;

    // Count positive and negative signals in those clauses
    let positiveCount = 0;
    let negativeCount = 0;

    for (const clause of relevantClauses) {
      const trimmedClause = clause.trim(); // Removing beginnning and ending whitespace

      // Checking if first word has a question pattern
      const firstWord = trimmedClause.split(/\s+/)[0];
      if (QUESTION_STARTERS.includes(firstWord)) continue; // Skips sentiment analysis if question

      // Getting a list of words in clause and removing all punctuation
      const cleanWords = trimmedClause.replace(/[^\w\s]/g, "").split(/\s+/);

      // Checking for POSITIVE SIGNALS
      for (const word of POSITIVE_SIGNALS) {
        // Handles case if negating word appears
        if (trimmedClause.includes(word)) {
          const index = cleanWords.indexOf(word);

          // Negating words before a positive signal = negative sentiment
          if (index > 0 && NEGATORS.includes(cleanWords[index - 1])) {
            negativeCount++;
          } else {
            positiveCount++;
          }
        }
      }

      // Checking for NEGATIVE SIGNALS
      for (const word of NEGATIVE_SIGNALS) {
        // Handles case if negating word appears
        if (trimmedClause.includes(word)) {
          const index = cleanWords.indexOf(word);

          // Negating words before a negative signal = positive sentiment
          if (index > 0 && NEGATORS.includes(cleanWords[index - 1])) {
            positiveCount++;
          } else {
            negativeCount++;
          }
        }
      }
    }

    // Determine sentiment for this topic; if positive=negative does not add
    if (positiveCount > negativeCount) {
      tags.push({ topic, sentiment: "positive", label: `+${topic}` });
    } else if (positiveCount < negativeCount) {
      tags.push({ topic, sentiment: "negative", label: `-${topic}` });
    }
  }
  return tags;
}

/**
 * Aggregates sentiment tags from multiple texts into a pros/cons summary.
 * Returns the most frequently mentioned positive and negative topics.
 */
export function aggregateSentiment(tagSets: ISentimentTag[][]): ISentimentSummary {
  const proCounts: Record<string, number> = {};
  const conCounts: Record<string, number> = {};

  for (const tags of tagSets) {
    for (const tag of tags) {
      if (tag.sentiment === "positive") {
        proCounts[tag.topic] = (proCounts[tag.topic] || 0) + 1;
      } else {
        conCounts[tag.topic] = (conCounts[tag.topic] || 0) + 1;
      }
    }
  }

  const pros = Object.entries(proCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);

  const cons = Object.entries(conCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);

  return {
    pros,
    cons,
    totalAnalyzed: tagSets.length,
  };
}
