export interface Report {
  id: string;
  itemId: string; // Discussion or Reply ID
  itemType: 'discussion' | 'reply';
  reason: string;
  details?: string;
  reportedBy: string;
  timestamp: number;
}

export interface Reply {
  id: string;
  discussionId: string;
  content: string;
  author: string;
  authorAvatar: string;
  timestamp: number;
  upvotes: number;
  downvotes: number;
  images?: string[]; // Base64 encoded images
  parentReplyId?: string; // For threaded replies
}

export interface Discussion {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  timestamp: number; // Unix timestamp
  category: string;
  tags: string[];
  images?: string[]; // Base64 encoded images
  upvotes: number;
  downvotes: number;
  replies: number;
  views: number;
}

// Mock discussions data
export const initialDiscussions: Discussion[] = [
  {
    id: "1",
    title: "Galaxy S24 Ultra vs iPhone 16 Pro Max - Real World Comparison",
    content: "After using both phones for 3 months, here's my honest take on which one is better for different use cases. The camera systems are vastly different and each has its strengths...",
    author: "TechEnthusiast2024",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TechEnthusiast2024",
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    category: "Comparisons",
    tags: ["Samsung", "Apple", "Flagship"],
    upvotes: 156,
    downvotes: 12,
    replies: 43,
    views: 2341
  },
  {
    id: "2",
    title: "Is the Pixel 10 camera really that good? My experience",
    content: "I've been testing the Pixel 10 for the past month and wanted to share my thoughts on the much-hyped camera system. Google's computational photography is impressive but...",
    author: "PhotoPro_Mike",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=PhotoPro_Mike",
    timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
    category: "Reviews",
    tags: ["Google", "Camera", "Photography"],
    upvotes: 234,
    downvotes: 8,
    replies: 67,
    views: 4521
  },
  {
    id: "3",
    title: "Best budget phones under $500 in 2025",
    content: "Looking for recommendations on the best budget-friendly phones that don't compromise on essential features. What are your top picks?",
    author: "BudgetBuyer",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BudgetBuyer",
    timestamp: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
    category: "Recommendations",
    tags: ["Budget", "Value", "Mid-range"],
    upvotes: 89,
    downvotes: 5,
    replies: 102,
    views: 1876
  },
  {
    id: "4",
    title: "Battery life comparison: Which phone lasts longest?",
    content: "I've been conducting real-world battery tests on the latest flagships. Here are my findings with actual screen-on time data across different usage patterns...",
    author: "BatteryTestGuru",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BatteryTestGuru",
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    category: "Testing",
    tags: ["Battery", "Performance", "Testing"],
    upvotes: 312,
    downvotes: 15,
    replies: 88,
    views: 5632
  },
  {
    id: "5",
    title: "Should I upgrade from Galaxy S23 to S24?",
    content: "Currently using a Galaxy S23 and wondering if the S24 offers enough improvements to justify the upgrade. What do you all think?",
    author: "SamsungUser2023",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SamsungUser2023",
    timestamp: Date.now() - 1000 * 60 * 60 * 36, // 1.5 days ago
    category: "Help",
    tags: ["Samsung", "Upgrade", "Advice"],
    upvotes: 67,
    downvotes: 3,
    replies: 54,
    views: 1234
  },
  {
    id: "6",
    title: "iOS 19 vs Android 15: Feature Comparison",
    content: "A deep dive into the latest OS versions from Apple and Google. Which one offers better features, privacy, and user experience?",
    author: "OSComparison",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=OSComparison",
    timestamp: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
    category: "Software",
    tags: ["iOS", "Android", "Software"],
    upvotes: 445,
    downvotes: 67,
    replies: 231,
    views: 8934
  },
  {
    id: "7",
    title: "Wireless charging: Is it damaging your battery?",
    content: "I've noticed some discussions about wireless charging potentially degrading battery health faster. Let's discuss the science behind this...",
    author: "TechScientist",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TechScientist",
    timestamp: Date.now() - 1000 * 60 * 60 * 72, // 3 days ago
    category: "Discussion",
    tags: ["Battery", "Charging", "Technology"],
    upvotes: 178,
    downvotes: 23,
    replies: 145,
    views: 3421
  },
  {
    id: "8",
    title: "Best phone cases that actually protect your device",
    content: "After dropping my phone one too many times, I'm on the hunt for cases that offer real protection without adding too much bulk. Recommendations?",
    author: "ClumzyButLearning",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ClumzyButLearning",
    timestamp: Date.now() - 1000 * 60 * 60 * 96, // 4 days ago
    category: "Accessories",
    tags: ["Accessories", "Protection", "Cases"],
    upvotes: 92,
    downvotes: 7,
    replies: 76,
    views: 1654
  }
];

// Helper functions for localStorage
export const getDiscussionsFromStorage = (): Discussion[] => {
  try {
    const stored = localStorage.getItem('discussions');
    return stored ? JSON.parse(stored) : initialDiscussions;
  } catch {
    return initialDiscussions;
  }
};

export const saveDiscussionsToStorage = (discussions: Discussion[]) => {
  try {
    localStorage.setItem('discussions', JSON.stringify(discussions));
  } catch {
    // Ignore storage errors
  }
};

export const getUserVotesFromStorage = (): Record<string, 'up' | 'down' | null> => {
  try {
    const stored = localStorage.getItem('discussionVotes');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const saveUserVotesToStorage = (votes: Record<string, 'up' | 'down' | null>) => {
  try {
    localStorage.setItem('discussionVotes', JSON.stringify(votes));
  } catch {
    // Ignore storage errors
  }
};

// Mock replies data
export const initialReplies: Reply[] = [
  {
    id: "r1",
    discussionId: "1",
    content: "Great comparison! I've been using the S24 Ultra and the camera is phenomenal in low light. The iPhone excels at video stabilization though.",
    author: "CameraEnthusiast",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CameraEnthusiast",
    timestamp: Date.now() - 1000 * 60 * 90,
    upvotes: 23,
    downvotes: 2
  },
  {
    id: "r2",
    discussionId: "1",
    content: "Have you tested the zoom capabilities? That's where Samsung usually shines with their periscope lens.",
    author: "ZoomMaster",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ZoomMaster",
    timestamp: Date.now() - 1000 * 60 * 75,
    upvotes: 15,
    downvotes: 1
  },
  {
    id: "r3",
    discussionId: "1",
    content: "iPhone's ecosystem integration is unmatched though. If you're already in the Apple ecosystem, it's a no-brainer.",
    author: "AppleFan",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AppleFan",
    timestamp: Date.now() - 1000 * 60 * 45,
    upvotes: 34,
    downvotes: 8
  },
  {
    id: "r4",
    discussionId: "2",
    content: "Pixel cameras have always been amazing! The night mode is incredible. How does it compare to previous Pixel models?",
    author: "PixelLover",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=PixelLover",
    timestamp: Date.now() - 1000 * 60 * 60 * 4,
    upvotes: 18,
    downvotes: 0
  },
  {
    id: "r5",
    discussionId: "2",
    content: "I found the Pixel 10 to be overly processed in some scenarios. Natural lighting photos look a bit artificial to me.",
    author: "NaturalPhotographer",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NaturalPhotographer",
    timestamp: Date.now() - 1000 * 60 * 60 * 3,
    upvotes: 12,
    downvotes: 5
  },
  {
    id: "r6",
    discussionId: "3",
    content: "Nothing Phone 2a is amazing value! Under $400 and performs like a flagship in daily use.",
    author: "BudgetExpert",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BudgetExpert",
    timestamp: Date.now() - 1000 * 60 * 60 * 10,
    upvotes: 45,
    downvotes: 3
  },
  {
    id: "r7",
    discussionId: "3",
    content: "Don't sleep on the Samsung A54. Great screen, battery life, and camera for the price.",
    author: "SamsungMidRange",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SamsungMidRange",
    timestamp: Date.now() - 1000 * 60 * 60 * 9,
    upvotes: 38,
    downvotes: 2
  },
  {
    id: "r8",
    discussionId: "4",
    content: "The ROG Phone 8 has insane battery life! Easily 2 days with moderate use.",
    author: "GamerPhoneUser",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=GamerPhoneUser",
    timestamp: Date.now() - 1000 * 60 * 60 * 20,
    upvotes: 27,
    downvotes: 1
  }
];

// Replies storage helpers
export const getRepliesFromStorage = (): Reply[] => {
  try {
    const stored = localStorage.getItem('discussionReplies');
    return stored ? JSON.parse(stored) : initialReplies;
  } catch {
    return initialReplies;
  }
};

export const saveRepliesToStorage = (replies: Reply[]) => {
  try {
    localStorage.setItem('discussionReplies', JSON.stringify(replies));
  } catch {
    // Ignore storage errors
  }
};

export const getReplyVotesFromStorage = (): Record<string, 'up' | 'down' | null> => {
  try {
    const stored = localStorage.getItem('replyVotes');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const saveReplyVotesToStorage = (votes: Record<string, 'up' | 'down' | null>) => {
  try {
    localStorage.setItem('replyVotes', JSON.stringify(votes));
  } catch {
    // Ignore storage errors
  }
};

// Reports storage helpers
export const getReportsFromStorage = (): Report[] => {
  try {
    const stored = localStorage.getItem('reports');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveReportsToStorage = (reports: Report[]) => {
  try {
    localStorage.setItem('reports', JSON.stringify(reports));
  } catch {
    // Ignore storage errors
  }
};

export const getUserReportsFromStorage = (): Record<string, boolean> => {
  try {
    const stored = localStorage.getItem('userReports');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const saveUserReportsToStorage = (userReports: Record<string, boolean>) => {
  try {
    localStorage.setItem('userReports', JSON.stringify(userReports));
  } catch {
    // Ignore storage errors
  }
};
