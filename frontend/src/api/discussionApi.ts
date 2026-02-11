const API_URL = "http://localhost:5001/api/discussions"; // CHANGE LATER ON PRODUCTION

export interface DiscussionResponse {
  _id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  category: string;
  tags: string[];
  images: string[];
  upvotes: number;
  downvotes: number;
  upvoters: string[];
  downvoters: string[];
  replyCount: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReplyResponse {
  _id: string;
  discussionId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  images: string[];
  upvotes: number;
  downvotes: number;
  upvoters: string[];
  downvoters: string[];
  parentReplyId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionsListResponse {
  discussions: DiscussionResponse[];
  totalDiscussions: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Fetches paginated discussions with optional filtering and search.
 */
export const getDiscussions = async (
  page: number = 1,
  limit: number = 20,
  filter: "recent" | "trending" | "popular" = "trending",
  search?: string,
  categories?: string[]
): Promise<DiscussionsListResponse | null> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      filter,
    });

    if (search && search.trim()) {
      params.append("search", search.trim());
    }

    if (categories && categories.length > 0) {
      params.append("categories", categories.join(","));
    }

    const response = await fetch(`${API_URL}?${params}`);

    if (!response.ok) {
      throw new Error("Failed to fetch discussions");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching discussions:", error);
    return null;
  }
};

/**
 * Fetches a single discussion by ID (increments view count).
 */
export const getDiscussion = async (
  id: string
): Promise<DiscussionResponse | null> => {
  try {
    const response = await fetch(`${API_URL}/${id}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Failed to fetch discussion");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching discussion:", error);
    return null;
  }
};

/**
 * Creates a new discussion.
 */
export const createDiscussion = async (
  data: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    images: string[];
  },
  token: string
): Promise<DiscussionResponse | null> => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create discussion");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating discussion:", error);
    throw error;
  }
};

/**
 * Votes on a discussion (upvote or downvote).
 */
export const voteOnDiscussion = async (
  id: string,
  voteType: "up" | "down",
  token: string
): Promise<DiscussionResponse | null> => {
  try {
    const response = await fetch(`${API_URL}/${id}/vote`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ voteType }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to vote on discussion");
    }

    return await response.json();
  } catch (error) {
    console.error("Error voting on discussion:", error);
    throw error;
  }
};

/**
 * Deletes a discussion (author only).
 */
export const deleteDiscussion = async (
  id: string,
  token: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete discussion");
    }

    return true;
  } catch (error) {
    console.error("Error deleting discussion:", error);
    throw error;
  }
};

/**
 * Fetches all replies for a discussion.
 */
export const getReplies = async (
  discussionId: string
): Promise<ReplyResponse[]> => {
  try {
    const response = await fetch(`${API_URL}/${discussionId}/replies`);

    if (!response.ok) {
      throw new Error("Failed to fetch replies");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching replies:", error);
    return [];
  }
};

/**
 * Creates a reply on a discussion.
 */
export const createReply = async (
  discussionId: string,
  data: {
    content: string;
    images: string[];
    parentReplyId?: string;
  },
  token: string
): Promise<ReplyResponse | null> => {
  try {
    const response = await fetch(`${API_URL}/${discussionId}/replies`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create reply");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating reply:", error);
    throw error;
  }
};

/**
 * Votes on a reply (upvote or downvote).
 */
export const voteOnReply = async (
  replyId: string,
  voteType: "up" | "down",
  token: string
): Promise<ReplyResponse | null> => {
  try {
    const response = await fetch(`${API_URL}/replies/${replyId}/vote`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ voteType }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to vote on reply");
    }

    return await response.json();
  } catch (error) {
    console.error("Error voting on reply:", error);
    throw error;
  }
};

/**
 * Deletes a reply (author only).
 */
export const deleteReply = async (
  replyId: string,
  token: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/replies/${replyId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete reply");
    }

    return true;
  } catch (error) {
    console.error("Error deleting reply:", error);
    throw error;
  }
};
