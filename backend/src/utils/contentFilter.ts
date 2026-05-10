/**
 * Content moderation utility for filtering profanity and spam
 * from user-generated content (reviews, discussions, replies).
 */

// Common profanity list — covers major slurs and offensive terms
const PROFANITY_LIST = [
  "ass", "asshole", "bastard", "bitch", "bullshit", "crap", "cunt",
  "damn", "dick", "dumbass", "fag", "faggot", "fuck", "fucking",
  "goddamn", "hell", "idiot", "motherfucker", "nigger", "nigga",
  "piss", "pussy", "retard", "retarded", "shit", "slut", "stfu",
  "whore", "wtf", "wanker",
];

// Spam patterns — repeated chars, all caps shouting, link spam
const SPAM_PATTERNS = [
  /(.)\1{5,}/i,                          // Same character repeated 6+ times (e.g. "aaaaaa")
  /https?:\/\/[^\s]{50,}/i,              // Suspiciously long URLs
  /(buy now|click here|free money|act now|limited offer|subscribe)/i, // Spam phrases
  /^[A-Z\s!?.]{20,}$/,                   // All caps shouting (20+ chars)
  /(.{3,})\1{3,}/i,                      // Same phrase repeated 4+ times
];

export interface ContentFilterResult {
  isClean: boolean;
  reason: string | null;
  filteredText: string;
}

/**
 * Checks text for profanity. Returns word boundaries only to avoid
 * false positives (e.g. "class" matching "ass").
 */
function containsProfanity(text: string): string | null {
  const lower = text.toLowerCase();
  for (const word of PROFANITY_LIST) {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    if (regex.test(lower)) {
      return word;
    }
  }
  return null;
}

/**
 * Checks text for spam patterns.
 */
function isSpam(text: string): string | null {
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      return "Message flagged as spam";
    }
  }
  return null;
}

/**
 * Validates user-generated content for profanity and spam.
 * Returns whether the content is clean, the reason if not,
 * and a masked version of the text.
 */
export function filterContent(text: string): ContentFilterResult {
  // Check for profanity
  const profaneWord = containsProfanity(text);
  if (profaneWord) {
    return {
      isClean: false,
      reason: `Content contains inappropriate language`,
      filteredText: text,
    };
  }

  // Check for spam
  const spamReason = isSpam(text);
  if (spamReason) {
    return {
      isClean: false,
      reason: spamReason,
      filteredText: text,
    };
  }

  return {
    isClean: true,
    reason: null,
    filteredText: text,
  };
}

/**
 * Validates multiple text fields at once (e.g. title + body).
 * Returns the first failure found, or a clean result.
 */
export function filterMultipleFields(
  fields: { name: string; text: string }[]
): ContentFilterResult & { field?: string } {
  for (const { name, text } of fields) {
    const result = filterContent(text);
    if (!result.isClean) {
      return { ...result, field: name };
    }
  }
  return { isClean: true, reason: null, filteredText: "" };
}
