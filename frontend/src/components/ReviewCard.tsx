import { useState } from "react";
import { ThumbsUp, ThumbsDown, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { StarRating } from "./StarRating";
import { MultiRatingInput, CategoryRatings } from "./MultiRatingInput";
import { useDarkMode } from "./DarkModeContext";

export interface ReviewData {
  id: number;
  userId?: string;
  userName: string;
  rating: number;
  categoryRatings: CategoryRatings;
  date: string;
  title: string;
  review: string;
  helpful: number;
  notHelpful: number;
  helpfulVoters?: string[];
  notHelpfulVoters?: string[];
}

interface ReviewCardProps {
  review: ReviewData;
  currentUserId?: string;
  onVote: (reviewId: number, voteType: "helpful" | "notHelpful") => void;
  onDelete?: (reviewId: number) => void;
  isVoting?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ReviewCard({
  review,
  currentUserId,
  onVote,
  onDelete,
  isVoting = false,
}: ReviewCardProps) {
  const { isDarkMode } = useDarkMode();
  const [showCategoryRatings, setShowCategoryRatings] = useState(false);

  const hasVotedHelpful = currentUserId && review.helpfulVoters?.includes(currentUserId);
  const hasVotedNotHelpful = currentUserId && review.notHelpfulVoters?.includes(currentUserId);
  const isOwnReview = currentUserId && review.userId === currentUserId;

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      onDelete?.(review.id);
    }
  };

  return (
    <div
      className={`p-6 rounded-xl border ${
        isDarkMode ? "bg-[#161b22] border-[#2d3748]" : "bg-white border-gray-200"
      }`}
    >
      {/* Header: Avatar, Name, Date, Rating */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
              isDarkMode ? "bg-[#4a7cf6] text-white" : "bg-[#2c3968] text-white"
            }`}
          >
            {getInitials(review.userName)}
          </div>
          <div>
            <p
              className={`font-medium ${
                isDarkMode ? "text-[#e0e4eb]" : "text-[#2c3968]"
              }`}
            >
              {review.userName}
            </p>
            <p
              className={`text-sm ${
                isDarkMode ? "text-[#a0a8b8]" : "text-[#666]"
              }`}
            >
              {review.date}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating value={review.rating} readonly size="sm" showValue />
          {isOwnReview && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className={`p-2 ${
                isDarkMode
                  ? "text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  : "text-red-500 hover:text-red-600 hover:bg-red-50"
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Title */}
      <h3
        className={`text-lg font-semibold mb-2 ${
          isDarkMode ? "text-[#e0e4eb]" : "text-[#1e1e1e]"
        }`}
      >
        {review.title}
      </h3>

      {/* Review Text */}
      <p
        className={`mb-4 leading-relaxed ${
          isDarkMode ? "text-[#a0a8b8]" : "text-[#666]"
        }`}
      >
        {review.review}
      </p>

      {/* Category Ratings Toggle */}
      {review.categoryRatings && (
        <div className="mb-4">
          <button
            onClick={() => setShowCategoryRatings(!showCategoryRatings)}
            className={`flex items-center gap-1 text-sm font-medium transition-colors ${
              isDarkMode
                ? "text-[#4a7cf6] hover:text-[#6b93f7]"
                : "text-[#2c3968] hover:text-[#4a5a8a]"
            }`}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showCategoryRatings ? "rotate-180" : ""
              }`}
            />
            <span>{showCategoryRatings ? "Hide" : "View"} detailed ratings</span>
          </button>

          {showCategoryRatings && (
            <div
              className={`mt-3 p-4 rounded-lg ${
                isDarkMode ? "bg-[#0d1117]" : "bg-[#f8f9fa]"
              }`}
            >
              <MultiRatingInput
                value={review.categoryRatings}
                onChange={() => {}}
                readonly
                showAverage={false}
                compact
              />
            </div>
          )}
        </div>
      )}

      {/* Helpful/Not Helpful Voting */}
      <div
        className={`flex items-center gap-4 pt-4 border-t ${
          isDarkMode ? "border-[#2d3748]" : "border-gray-200"
        }`}
      >
        <span
          className={`text-sm ${
            isDarkMode ? "text-[#a0a8b8]" : "text-[#666]"
          }`}
        >
          Was this review helpful?
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVote(review.id, "helpful")}
            disabled={isVoting || isOwnReview}
            className={`flex items-center gap-1 px-2 py-1 ${
              hasVotedHelpful
                ? isDarkMode
                  ? "bg-green-900/30 text-green-400"
                  : "bg-green-100 text-green-700"
                : isDarkMode
                ? "text-[#a0a8b8] hover:text-green-400 hover:bg-green-900/20"
                : "text-[#666] hover:text-green-600 hover:bg-green-50"
            } ${isOwnReview ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{review.helpful}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVote(review.id, "notHelpful")}
            disabled={isVoting || isOwnReview}
            className={`flex items-center gap-1 px-2 py-1 ${
              hasVotedNotHelpful
                ? isDarkMode
                  ? "bg-red-900/30 text-red-400"
                  : "bg-red-100 text-red-700"
                : isDarkMode
                ? "text-[#a0a8b8] hover:text-red-400 hover:bg-red-900/20"
                : "text-[#666] hover:text-red-600 hover:bg-red-50"
            } ${isOwnReview ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <ThumbsDown className="w-4 h-4" />
            <span>{review.notHelpful}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
