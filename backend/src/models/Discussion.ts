import mongoose, { Document, Schema } from "mongoose";

/**
 * Interface for a Discussion document.
 */
export interface IDiscussion extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for a Reply document.
 */
export interface IReply extends Document {
  discussionId: mongoose.Types.ObjectId;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  images: string[];
  upvotes: number;
  downvotes: number;
  upvoters: string[];
  downvoters: string[];
  parentReplyId: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for Discussion.
 */
const discussionSchema = new Schema<IDiscussion>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    authorAvatar: { type: String, default: "" },
    category: { type: String, default: "Discussion" },
    tags: { type: [String], default: [] },
    images: { type: [String], default: [] },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    upvoters: { type: [String], default: [] },
    downvoters: { type: [String], default: [] },
    replyCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/**
 * Mongoose schema for Reply.
 */
const replySchema = new Schema<IReply>(
  {
    discussionId: { type: Schema.Types.ObjectId, ref: "Discussion", required: true },
    content: { type: String, required: true },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    authorAvatar: { type: String, default: "" },
    images: { type: [String], default: [] },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    upvoters: { type: [String], default: [] },
    downvoters: { type: [String], default: [] },
    parentReplyId: { type: Schema.Types.ObjectId, ref: "Reply", default: null },
  },
  { timestamps: true }
);

export const Discussion = mongoose.model<IDiscussion>("Discussion", discussionSchema);
export const Reply = mongoose.model<IReply>("Reply", replySchema);
