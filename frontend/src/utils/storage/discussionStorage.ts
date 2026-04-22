import { Discussion, Reply, Report } from "../../types/discussionTypes";
import { initialDiscussions, initialReplies } from "../../data/discussionsData";

// ------------------------------------------------------------
// | DISCUSSION
// ------------------------------------------------------------
// Helper functions for localStorage
export const getDiscussionsFromStorage = (): Discussion[] => {
  try {
    const stored = localStorage.getItem("discussions");
    return stored ? JSON.parse(stored) : initialDiscussions;
  } catch {
    return initialDiscussions;
  }
};

export const saveDiscussionsToStorage = (discussions: Discussion[]) => {
  try {
    localStorage.setItem("discussions", JSON.stringify(discussions));
  } catch {
    // Ignore storage errors
  }
};

export const getUserVotesFromStorage = (): Record<string, "up" | "down" | null> => {
  try {
    const stored = localStorage.getItem("discussionVotes");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const saveUserVotesToStorage = (votes: Record<string, "up" | "down" | null>) => {
  try {
    localStorage.setItem("discussionVotes", JSON.stringify(votes));
  } catch {
    // Ignore storage errors
  }
};

// ------------------------------------------------------------
// | REPLY
// ------------------------------------------------------------

// Replies storage helpers
export const getRepliesFromStorage = (): Reply[] => {
  try {
    const stored = localStorage.getItem("discussionReplies");
    return stored ? JSON.parse(stored) : initialReplies;
  } catch {
    return initialReplies;
  }
};

export const saveRepliesToStorage = (replies: Reply[]) => {
  try {
    localStorage.setItem("discussionReplies", JSON.stringify(replies));
  } catch {
    // Ignore storage errors
  }
};

export const getReplyVotesFromStorage = (): Record<string, "up" | "down" | null> => {
  try {
    const stored = localStorage.getItem("replyVotes");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const saveReplyVotesToStorage = (votes: Record<string, "up" | "down" | null>) => {
  try {
    localStorage.setItem("replyVotes", JSON.stringify(votes));
  } catch {
    // Ignore storage errors
  }
};

// ------------------------------------------------------------
// | REPORT
// ------------------------------------------------------------

// Reports storage helpers
export const getReportsFromStorage = (): Report[] => {
  try {
    const stored = localStorage.getItem("reports");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveReportsToStorage = (reports: Report[]) => {
  try {
    localStorage.setItem("reports", JSON.stringify(reports));
  } catch {
    // Ignore storage errors
  }
};

export const getUserReportsFromStorage = (): Record<string, boolean> => {
  try {
    const stored = localStorage.getItem("userReports");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const saveUserReportsToStorage = (userReports: Record<string, boolean>) => {
  try {
    localStorage.setItem("userReports", JSON.stringify(userReports));
  } catch {
    // Ignore storage errors
  }
};
