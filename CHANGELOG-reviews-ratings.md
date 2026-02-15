# Reviews & Ratings Feature Implementation

**Author:** Darren Ammara
**Date:** January 31, 2026
**Use Cases:** UC-16 (Leave User Review), UC-18 (Leave User Rating)

---

## Overview

Implemented multi-dimensional user ratings and text reviews for phones. Users can rate phones across 5 categories (camera, battery, design, performance, value), write detailed reviews, and vote on other users' reviews as helpful/not helpful.

---

## New Files Created

### Backend

| File | Description |
|------|-------------|
| `backend/src/services/reviewService.ts` | Database operations for reviews (add, get, vote, delete) |
| `backend/src/controllers/reviewController.ts` | Request handlers with validation for review endpoints |
| `backend/src/routes/reviewRoutes.ts` | REST API route definitions |

### Frontend

| File | Description |
|------|-------------|
| `frontend/src/components/StarRating.tsx` | Reusable interactive star rating component with hover states |
| `frontend/src/components/MultiRatingInput.tsx` | Multi-category rating input (5 categories with icons) |
| `frontend/src/components/ReviewForm.tsx` | Complete review submission form with validation |
| `frontend/src/components/ReviewCard.tsx` | Individual review display card with voting buttons |
| `frontend/src/api/reviewApi.ts` | API client functions for review endpoints |

---

## Modified Files

### Backend

| File | Changes |
|------|---------|
| `backend/src/models/Phone.ts` | Added `ICategoryRatings` interface, updated `IReview` with `userId`, `categoryRatings`, `helpfulVoters`, `notHelpfulVoters` |
| `backend/src/server.ts` | Imported and mounted `reviewRoutes` under `/api/phones` |

### Frontend

| File | Changes |
|------|---------|
| `frontend/src/components/PhoneSpecPage.tsx` | Integrated new review components, added API calls, authentication checks, loading states |
| `frontend/src/data/phoneData.ts` | Updated `Review` interface to include optional `userId`, `helpfulVoters`, `notHelpfulVoters` |

---

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/phones/:phoneId/reviews` | No | Get paginated reviews for a phone |
| `POST` | `/api/phones/:phoneId/reviews` | Yes | Submit a new review |
| `PUT` | `/api/phones/:phoneId/reviews/:reviewId/vote` | Yes | Vote helpful or not helpful |
| `DELETE` | `/api/phones/:phoneId/reviews/:reviewId` | Yes | Delete own review |

### Request/Response Examples

**POST /api/phones/galaxy-s24-ultra/reviews**
```json
// Request Body
{
  "title": "Great phone!",
  "review": "This is my detailed review of the phone...",
  "categoryRatings": {
    "camera": 5,
    "battery": 4,
    "design": 5,
    "performance": 5,
    "value": 4
  }
}

// Response (201 Created)
{
  "id": 1,
  "userId": "firebase-uid-123",
  "userName": "John Doe",
  "rating": 4.6,
  "categoryRatings": { ... },
  "date": "January 31, 2026",
  "title": "Great phone!",
  "review": "This is my detailed review...",
  "helpful": 0,
  "notHelpful": 0,
  "helpfulVoters": [],
  "notHelpfulVoters": []
}
```

**PUT /api/phones/galaxy-s24-ultra/reviews/1/vote**
```json
// Request Body
{
  "voteType": "helpful"  // or "notHelpful"
}
```

---

## Database Schema Changes

### IReview (embedded in Phone document)

```typescript
interface IReview {
  id: number;
  userId: string;           // Firebase UID - NEW
  userName: string;
  rating: number;           // Auto-calculated from categoryRatings
  categoryRatings: {        // NEW
    camera: number;         // 1-5
    battery: number;        // 1-5
    design: number;         // 1-5
    performance: number;    // 1-5
    value: number;          // 1-5
  };
  date: string;
  title: string;
  review: string;
  helpful: number;
  notHelpful: number;
  helpfulVoters: string[];    // NEW - tracks who voted helpful
  notHelpfulVoters: string[]; // NEW - tracks who voted not helpful
}
```

---

## Features Implemented

### Use Case 18 - Leave User Rating
- 5 category star ratings (camera, battery, design, performance, value)
- Interactive star rating with hover effects
- Automatic overall rating calculation (average of categories)
- Visual display of category averages on phone spec page

### Use Case 16 - Leave User Review
- Title field (5-100 characters)
- Review text field (20-2000 characters)
- Form validation with inline error messages
- Character count display
- Submit/Cancel buttons with loading states
- Toast notifications for success/error

### Additional Features
- One review per user per phone (enforced by backend)
- Helpful/Not helpful voting (persisted to database)
- Toggle vote (click again to remove vote)
- Users can only delete their own reviews
- Pagination (3 reviews per page)
- Loading states while fetching reviews
- Fallback to mock data if API unavailable

---

## Testing Instructions

1. **Start Backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Flow**
   - Navigate to a phone spec page (e.g., `/phones/galaxy-s24-ultra`)
   - Scroll to Reviews section
   - Click "Write a Review" (must be logged in)
   - Fill out all 5 category ratings
   - Enter title and review text
   - Submit and verify it appears in the list
   - Test voting on other reviews
   - Test deleting your own review

---

## Dependencies

No new dependencies added. Uses existing:
- Express + Mongoose (backend)
- React + Tailwind + Radix UI (frontend)
- Firebase Auth (authentication)
- Sonner (toast notifications)
