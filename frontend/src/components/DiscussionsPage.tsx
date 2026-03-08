import { useState, useEffect, useRef, useCallback } from "react";
import { ThumbsUp, ThumbsDown, MessageCircle, Eye, Plus, TrendingUp, Clock, Flame, Search, Image as ImageIcon, X, Flag, CornerDownRight, Loader2, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { toast } from "sonner@2.0.3";
import { useAuth } from "../context/AuthContext";
import {
  Discussion,
  Report,
  getDiscussionsFromStorage,
  saveDiscussionsToStorage,
  getUserVotesFromStorage,
  saveUserVotesToStorage,
  getReportsFromStorage,
  saveReportsToStorage,
  getUserReportsFromStorage,
  saveUserReportsToStorage
} from "../data/discussionsData";
import * as discussionApi from "../api/discussionApi";

type FilterType = "recent" | "trending" | "popular";

interface DiscussionsPageProps {
  onNavigate?: (phoneId: string) => void;
  onViewDiscussion?: (discussionId: string) => void;
}

/**
 * Maps an API discussion response to the frontend Discussion interface.
 */
function mapApiDiscussion(d: discussionApi.DiscussionResponse): Discussion {
  return {
    id: d._id,
    title: d.title,
    content: d.content,
    author: d.authorName,
    authorId: d.authorId,
    authorAvatar: d.authorAvatar,
    timestamp: new Date(d.createdAt).getTime(),
    category: d.category,
    tags: d.tags,
    images: d.images,
    upvotes: d.upvotes,
    downvotes: d.downvotes,
    upvoters: d.upvoters,
    downvoters: d.downvoters,
    replies: d.replyCount,
    views: d.views,
  };
}

export default function DiscussionsPage({ onNavigate, onViewDiscussion }: DiscussionsPageProps) {
  const { currentUser } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down' | null>>({});
  const [filter, setFilter] = useState<FilterType>("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [usingApi, setUsingApi] = useState(true);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "Discussion",
    tags: ""
  });
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportItemId, setReportItemId] = useState<string>("");
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [userReports, setUserReports] = useState<Record<string, boolean>>({});

  // Fetch discussions from API with localStorage fallback
  const fetchDiscussions = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await discussionApi.getDiscussions(
        1,
        100,
        filter,
        searchQuery || undefined,
        selectedCategories.length > 0 ? selectedCategories : undefined
      );

      if (result && result.discussions.length >= 0) {
        const mapped = result.discussions.map(mapApiDiscussion);
        setDiscussions(mapped);
        setUsingApi(true);

        // Build user votes from upvoters/downvoters arrays
        if (currentUser) {
          const votes: Record<string, 'up' | 'down' | null> = {};
          mapped.forEach((d) => {
            if (d.upvoters?.includes(currentUser.uid)) {
              votes[d.id] = 'up';
            } else if (d.downvoters?.includes(currentUser.uid)) {
              votes[d.id] = 'down';
            }
          });
          setUserVotes(votes);
        }
      } else {
        throw new Error("API returned null");
      }
    } catch {
      // Fallback to localStorage
      console.warn("API unavailable, falling back to localStorage");
      const loadedDiscussions = getDiscussionsFromStorage();
      const loadedVotes = getUserVotesFromStorage();
      setDiscussions(loadedDiscussions);
      setUserVotes(loadedVotes);
      setUsingApi(false);
    } finally {
      setIsLoading(false);
    }
  }, [filter, searchQuery, selectedCategories, currentUser]);

  // Load discussions on mount and when filters change
  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  // Load reports from localStorage (reports stay local for now)
  useEffect(() => {
    const loadedUserReports = getUserReportsFromStorage();
    setUserReports(loadedUserReports);
  }, []);

  // Get all unique categories from discussions
  const allCategories = Array.from(new Set(discussions.map(d => d.category))).sort();

  // Handle voting
  const handleVote = async (discussionId: string, voteType: 'up' | 'down') => {
    if (usingApi) {
      if (!currentUser) {
        toast.error("Please sign in to vote");
        return;
      }
      try {
        const token = await currentUser.firebaseUser.getIdToken();
        const updated = await discussionApi.voteOnDiscussion(discussionId, voteType, token);
        if (updated) {
          const mapped = mapApiDiscussion(updated);
          setDiscussions((prev) =>
            prev.map((d) => (d.id === discussionId ? mapped : d))
          );
          // Update local vote tracking
          if (updated.upvoters.includes(currentUser.uid)) {
            setUserVotes((prev) => ({ ...prev, [discussionId]: 'up' }));
          } else if (updated.downvoters.includes(currentUser.uid)) {
            setUserVotes((prev) => ({ ...prev, [discussionId]: 'down' }));
          } else {
            setUserVotes((prev) => ({ ...prev, [discussionId]: null }));
          }
        }
      } catch {
        toast.error("Failed to vote");
      }
    } else {
      // localStorage fallback
      const currentVote = userVotes[discussionId];
      let newVote: 'up' | 'down' | null = voteType;

      if (currentVote === voteType) {
        newVote = null;
      }

      const updatedDiscussions = discussions.map(disc => {
        if (disc.id === discussionId) {
          let upvotes = disc.upvotes;
          let downvotes = disc.downvotes;
          if (currentVote === 'up') upvotes--;
          if (currentVote === 'down') downvotes--;
          if (newVote === 'up') upvotes++;
          if (newVote === 'down') downvotes++;
          return { ...disc, upvotes, downvotes };
        }
        return disc;
      });

      const updatedVotes = { ...userVotes, [discussionId]: newVote };
      setDiscussions(updatedDiscussions);
      setUserVotes(updatedVotes);
      saveDiscussionsToStorage(updatedDiscussions);
      saveUserVotesToStorage(updatedVotes);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') && newPostImages.length < 4) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setNewPostImages(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setNewPostImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle creating new post
  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    if (usingApi) {
      if (!currentUser) {
        toast.error("Please sign in to create a discussion");
        return;
      }

      setIsCreating(true);
      try {
        const token = await currentUser.firebaseUser.getIdToken();
        const created = await discussionApi.createDiscussion(
          {
            title: newPost.title,
            content: newPost.content,
            category: newPost.category,
            tags: newPost.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
            images: newPostImages,
          },
          token
        );

        if (created) {
          const mapped = mapApiDiscussion(created);
          setDiscussions((prev) => [mapped, ...prev]);
          toast.success("Discussion created successfully!");
        }
      } catch {
        toast.error("Failed to create discussion");
      } finally {
        setIsCreating(false);
      }
    } else {
      // localStorage fallback
      const newDiscussion: Discussion = {
        id: Date.now().toString(),
        title: newPost.title,
        content: newPost.content,
        author: currentUser?.displayName || "You",
        authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.displayName || "You"}`,
        timestamp: Date.now(),
        category: newPost.category,
        tags: newPost.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
        upvotes: 0,
        downvotes: 0,
        replies: 0,
        views: 0,
        images: newPostImages.length > 0 ? newPostImages : undefined
      };

      const updatedDiscussions = [newDiscussion, ...discussions];
      setDiscussions(updatedDiscussions);
      saveDiscussionsToStorage(updatedDiscussions);
    }

    setNewPost({ title: "", content: "", category: "Discussion", tags: "" });
    setNewPostImages([]);
    setIsCreateDialogOpen(false);
  };

  // Handle deleting a discussion
  const handleDeleteDiscussion = async (discussionId: string) => {
    if (!currentUser) return;
    if (!window.confirm("Are you sure you want to delete this discussion?")) return;

    if (usingApi) {
      try {
        const token = await currentUser.firebaseUser.getIdToken();
        await discussionApi.deleteDiscussion(discussionId, token);
        setDiscussions((prev) => prev.filter((d) => d.id !== discussionId));
        toast.success("Discussion deleted successfully!");
      } catch {
        toast.error("Failed to delete discussion");
      }
    }
  };

  // Handle opening report dialog
  const handleOpenReportDialog = (itemId: string) => {
    setReportItemId(itemId);
    setReportReason("");
    setReportDetails("");
    setIsReportDialogOpen(true);
  };

  // Handle submitting report
  const handleSubmitReport = () => {
    if (!reportReason) return;

    const report: Report = {
      id: `report_${Date.now()}`,
      itemId: reportItemId,
      itemType: 'discussion',
      reason: reportReason,
      details: reportDetails || undefined,
      reportedBy: currentUser?.displayName || "You",
      timestamp: Date.now()
    };

    const reports = getReportsFromStorage();
    const updatedReports = [...reports, report];
    saveReportsToStorage(updatedReports);

    const updatedUserReports = { ...userReports, [reportItemId]: true };
    setUserReports(updatedUserReports);
    saveUserReportsToStorage(updatedUserReports);

    setIsReportDialogOpen(false);
    setReportReason("");
    setReportDetails("");
    toast.success("Report submitted. Thank you!");
  };

  // Toggle category filter
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Filter and sort discussions (only needed for localStorage fallback - API handles this)
  const getFilteredDiscussions = () => {
    if (usingApi) return discussions; // API already handles filtering/sorting

    let filtered = [...discussions];

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(disc => selectedCategories.includes(disc.category));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(disc =>
        disc.title.toLowerCase().includes(query) ||
        disc.content.toLowerCase().includes(query) ||
        disc.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    switch (filter) {
      case "recent":
        return filtered.sort((a, b) => b.timestamp - a.timestamp);
      case "trending":
        return filtered.sort((a, b) => {
          const aScore = (a.upvotes - a.downvotes) * 2 + a.replies * 1.5 + a.views * 0.1 - (Date.now() - a.timestamp) / (1000 * 60 * 60 * 24);
          const bScore = (b.upvotes - b.downvotes) * 2 + b.replies * 1.5 + b.views * 0.1 - (Date.now() - b.timestamp) / (1000 * 60 * 60 * 24);
          return bScore - aScore;
        });
      case "popular":
        return filtered.sort((a, b) => {
          const aScore = (a.upvotes - a.downvotes) * 3 + a.replies * 2 + a.views * 0.2;
          const bScore = (b.upvotes - b.downvotes) * 3 + b.replies * 2 + b.views * 0.2;
          return bScore - aScore;
        });
      default:
        return filtered;
    }
  };

  const filteredDiscussions = getFilteredDiscussions();

  // Format time ago
  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-12">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-[#2c3968] via-[#3d4a7a] to-[#2c3968] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-6 py-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-white mb-3">Community Discussions</h1>
              <p className="text-white/80 text-lg">Share your thoughts, ask questions, and connect with the community</p>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-[#2c3968] hover:bg-white/90 shadow-lg self-start md:self-auto">
                  <Plus className="w-5 h-5 mr-2" />
                  New Discussion
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Discussion</DialogTitle>
                  <DialogDescription>
                    Start a new conversation with the community
                  </DialogDescription>
                </DialogHeader>
                {!currentUser ? (
                  <p className="text-center text-[#666] py-8">Please sign in to create a discussion.</p>
                ) : (
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="What's on your mind?"
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        placeholder="Share your thoughts, questions, or insights..."
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        className="mt-1.5 min-h-[150px]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        placeholder="e.g., Reviews, Comparisons, Help"
                        value={newPost.category}
                        onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        placeholder="e.g., Samsung, Camera, Battery"
                        value={newPost.tags}
                        onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Images (up to 4)</Label>
                      <div className="mt-1.5 space-y-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={newPostImages.length >= 4}
                          className="w-full"
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Upload Images ({newPostImages.length}/4)
                        </Button>
                        {newPostImages.length > 0 && (
                          <div className="grid grid-cols-2 gap-3">
                            {newPostImages.map((img, idx) => (
                              <div key={idx} className="relative group">
                                <img
                                  src={img}
                                  alt={`Upload ${idx + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border border-[#e0e0e0]"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => {
                        setIsCreateDialogOpen(false);
                        setNewPostImages([]);
                      }}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreatePost}
                        disabled={!newPost.title.trim() || !newPost.content.trim() || isCreating}
                        className="bg-[#2c3968] hover:bg-[#1e2547]"
                      >
                        {isCreating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Discussion"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filter === "trending" ? "default" : "outline"}
                onClick={() => setFilter("trending")}
                className={filter === "trending" ? "bg-[#2c3968] hover:bg-[#1e2547]" : ""}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Trending
              </Button>
              <Button
                variant={filter === "recent" ? "default" : "outline"}
                onClick={() => setFilter("recent")}
                className={filter === "recent" ? "bg-[#2c3968] hover:bg-[#1e2547]" : ""}
              >
                <Clock className="w-4 h-4 mr-2" />
                Recent
              </Button>
              <Button
                variant={filter === "popular" ? "default" : "outline"}
                onClick={() => setFilter("popular")}
                className={filter === "popular" ? "bg-[#2c3968] hover:bg-[#1e2547]" : ""}
              >
                <Flame className="w-4 h-4 mr-2" />
                Popular
              </Button>
            </div>

            {/* Search */}
            <div className="relative md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
              <Input
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filters */}
          {allCategories.length > 0 && (
            <div className="border-t border-[#e0e0e0] pt-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-[#666]">Categories:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCategories([])}
                  className={selectedCategories.length === 0 ? "bg-[#2c3968] text-white hover:bg-[#1e2547] hover:text-white" : ""}
                >
                  All
                </Button>
                {allCategories.map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    onClick={() => toggleCategory(category)}
                    className={selectedCategories.includes(category) ? "bg-[#2c3968] text-white hover:bg-[#1e2547] hover:text-white" : ""}
                  >
                    {category}
                    <span className="ml-2 text-xs opacity-70">
                      ({discussions.filter(d => d.category === category).length})
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Discussion List */}
      <div className="max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-6 mt-8">
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <Loader2 className="w-8 h-8 text-[#2c3968] mx-auto mb-4 animate-spin" />
              <p className="text-[#666]">Loading discussions...</p>
            </div>
          ) : filteredDiscussions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <MessageCircle className="w-16 h-16 text-[#ccc] mx-auto mb-4" />
              <h3 className="text-[#2c3968] mb-2">No discussions found</h3>
              <p className="text-[#666]">
                {searchQuery ? "Try adjusting your search query" : "Be the first to start a discussion!"}
              </p>
            </div>
          ) : (
            filteredDiscussions.map((discussion) => {
              const userVote = userVotes[discussion.id];
              const netScore = discussion.upvotes - discussion.downvotes;
              const isOwnDiscussion = currentUser && discussion.authorId === currentUser.uid;

              return (
                <div
                  key={discussion.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-transparent hover:border-[#2c3968]/10"
                >
                  <div className="flex gap-4 p-6">
                    {/* Vote Section */}
                    <div className="flex flex-col items-center gap-2 min-w-[60px]">
                      <button
                        onClick={() => handleVote(discussion.id, 'up')}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          userVote === 'up'
                            ? 'bg-[#2c3968] text-white'
                            : 'bg-[#f0f2f5] text-[#666] hover:bg-[#2c3968] hover:text-white'
                        }`}
                      >
                        <ThumbsUp className="w-5 h-5" />
                      </button>
                      <span className={`font-semibold ${netScore > 0 ? 'text-[#2c3968]' : netScore < 0 ? 'text-red-500' : 'text-[#666]'}`}>
                        {netScore > 0 ? '+' : ''}{netScore}
                      </span>
                      <button
                        onClick={() => handleVote(discussion.id, 'down')}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          userVote === 'down'
                            ? 'bg-red-500 text-white'
                            : 'bg-[#f0f2f5] text-[#666] hover:bg-red-500 hover:text-white'
                        }`}
                      >
                        <ThumbsDown className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <img
                          src={discussion.authorAvatar}
                          alt={discussion.author}
                          className="w-10 h-10 rounded-full bg-[#f0f2f5]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[#2c3968]">{discussion.author}</span>
                            <span className="text-[#999]">•</span>
                            <span className="text-[#999] text-sm">{getTimeAgo(discussion.timestamp)}</span>
                            <Badge variant="outline" className="ml-auto">
                              {discussion.category}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Title */}
                      <h3
                        className="text-[#2c3968] mb-2 cursor-pointer hover:text-[#1e2547] transition-colors"
                        onClick={() => onViewDiscussion?.(discussion.id)}
                      >
                        {discussion.title}
                      </h3>

                      {/* Content Preview */}
                      <p className="text-[#666] mb-3 line-clamp-2">
                        {discussion.content}
                      </p>

                      {/* Tags */}
                      {discussion.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {discussion.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-[#f0f2f5] text-[#2c3968] text-xs rounded-full hover:bg-[#2c3968] hover:text-white transition-colors cursor-pointer"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Stats and Actions */}
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4 text-sm text-[#999]">
                          <div className="flex items-center gap-1.5">
                            <MessageCircle className="w-4 h-4" />
                            <span>{discussion.replies} replies</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4" />
                            <span>{discussion.views.toLocaleString()} views</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDiscussion?.(discussion.id);
                            }}
                            className="text-[#2c3968] hover:bg-[#2c3968] hover:text-white border-[#2c3968]/20"
                          >
                            <CornerDownRight className="w-4 h-4 mr-1.5" />
                            Reply
                          </Button>
                          {isOwnDiscussion && usingApi && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDiscussion(discussion.id);
                              }}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              Delete
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenReportDialog(discussion.id);
                            }}
                            disabled={userReports[discussion.id]}
                            className={`text-xs ${userReports[discussion.id] ? 'text-red-400' : 'text-[#999] hover:text-red-500'}`}
                          >
                            <Flag className="w-3.5 h-3.5 mr-1" />
                            {userReports[discussion.id] ? 'Reported' : 'Report'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report Discussion</DialogTitle>
            <DialogDescription>
              Help us keep the community safe by reporting content that violates our guidelines.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Reason for reporting *</Label>
              <RadioGroup value={reportReason} onValueChange={setReportReason} className="mt-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spam" id="spam" />
                  <Label htmlFor="spam" className="cursor-pointer">Spam or misleading</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="harassment" id="harassment" />
                  <Label htmlFor="harassment" className="cursor-pointer">Harassment or hate speech</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inappropriate" id="inappropriate" />
                  <Label htmlFor="inappropriate" className="cursor-pointer">Inappropriate content</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="misinformation" id="misinformation" />
                  <Label htmlFor="misinformation" className="cursor-pointer">Misinformation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="cursor-pointer">Other</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="details">Additional details (optional)</Label>
              <Textarea
                id="details"
                placeholder="Provide more context about why you're reporting this..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                className="mt-1.5 min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReport}
                disabled={!reportReason}
                className="bg-red-500 hover:bg-red-600"
              >
                Submit Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
