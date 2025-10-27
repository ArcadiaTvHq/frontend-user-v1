// User interface
export interface User {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  first_name: string;
  last_name: string;
  email: string;
  image_url: string | null;
  user_type: string;
  language: string;
  is_verified: boolean;
  user_status: string;
  location: string | null;
  subscription_id: string | null;
}

// Movie interface
export interface Movie {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  genres: string[];
  tags: string[];
  cast: string[];
  crew: string[];
  creator: string | null;
}

// Series interface
export interface Series {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  genres: string[];
  tags: string[];
  cast: string[];
  crew: string[];
  creator: string;
}

// Season interface
export interface Season {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  season_number: number;
}

// Episode interface
export interface Episode {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  episode_number: number;
}

// Comment interfaces
export interface CommentUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Comment {
  id: string;
  comment: string;
  rating?: number;
  review?: string;
  type: "rating_and_comment" | "comment_only" | "rating_only";
  user: CommentUser;
  replies?: Comment[];
  created_at: string;
  is_edited: boolean;
  edited_at: string | null;
}

export interface CommentListResponse {
  data: Comment[];
}

export interface CommentSubmission {
  id: string;
  rating: number;
  comment: string;
  review: string;
  type: "rating_and_comment" | "comment_only" | "rating_only";
  submitted_at: string;
  is_edited: boolean;
  edited_at: string | null;
}

// Interactions interface
export interface Interactions {
  reactions: Record<string, any>;
  rating: {
    average: number;
    total: number;
  };
  comments: {
    total_count: number;
    top_level_count: number;
    replies_count: number;
  };
  user: {
    reaction: string | null;
    submission: CommentSubmission | null;
  };
  watched_duration: number;
  can_comment: boolean;
}

// Content interface
export interface Content {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  type: "movie" | "series" | "season" | "episode";
  title: string;
  slug: string;
  description: string;
  status: string;
  visibility: string;
  video_uid: string | null;
  video_url: string | null; // Direct Cloudflare HLS URL that doesn't expire
  trailer_video_uid: string | null;
  trailer_url: string | null; // Direct Cloudflare HLS URL for trailer that doesn't expire
  trailer_upload_status: "pending" | "ready" | "error" | null;
  thumbnail_image_id: string | null;
  poster_image_id: string | null;
  banner_image_id: string | null;
  release_date: string | null;
  is_featured: boolean | null;
  is_premium: boolean | null;
  is_free: boolean | null;
  available_in: string[];
  language: string;
  countries: string[];
  regions: string[];
  duration_in_seconds: number | null;
  uploaded_by_id: string;
  approved_by_id: string | null;
  approved_at: string | null;
  upload_status: "pending" | "ready" | "error" | null;
  uploaded_by: User;
  approved_by: User | null;

  // NEW: Direct metadata on content (preferred)
  genres?: string[];
  tags?: string[];
  cast?: string[];
  crew?: string[];
  creator?: string | null;

  // NEW: Hierarchical structure
  parent_id?: string | null;
  parent?: Content | null; // Optional loaded parent
  children?: Content[]; // Optional loaded children
  season_number?: number;
  episode_number?: number;

  // NEW: Watch progress tracking
  has_been_watched?: boolean; // Whether this content/episode has been watched
  last_watched_position?: number; // Last watched position in seconds
  progress_percentage?: number; // Progress percentage (0-100)
  is_completed?: boolean; // Whether content is fully watched

  // OLD: Nested entity structure (for backward compatibility)
  series: Series | null;
  movie: Movie | null;
  season: Season | null;
  episode: Episode | null;

  trailer: null;
  advert: null;
  interactions?: Interactions;
  in_watch_list?: boolean;
}

// Response interfaces
export interface ContentListResponse {
  status: string;
  message: string;
  data: Content[];
  meta: {
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface SingleContentResponse {
  message: string;
  data: Content;
}

export interface SignedUrlResponse {
  message: string;
  url: string;
  expires_in_seconds: number;
}

// Enums
export enum EContentType {
  MOVIE = "movie",
  SERIES = "series",
  SEASON = "season",
  EPISODE = "episode",
  TRAILER = "trailer",
  ADVERT = "advert",
}

export enum EContentStatus {
  DRAFT = "draft",
  PENDING = "pending",
  PUBLISHED = "published",
  REJECTED = "rejected",
}

export enum ELanguage {
  ENGLISH = "English",
  FRENCH = "French",
  SPANISH = "Spanish",
  // Add other languages as needed
}

export enum EContentVisibility {
  PUBLIC = "public",
  PRIVATE = "private",
}

export enum EUploadStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

// Query Parameters interface
export interface ContentQueryParams {
  // Pagination
  page?: number;
  limit?: number;

  // Content filters
  types?: EContentType[];
  status?: EContentStatus[];
  released_before?: Date | string;
  released_after?: Date | string;
  is_featured?: boolean;
  is_premium?: boolean;
  is_free?: boolean;
  language?: ELanguage;
  country?: string;
  region?: string;
  visibility?: EContentVisibility;
  search?: string;
  uploaded_by_id?: string;
  upload_status?: EUploadStatus;
  trailer_upload_status?: EUploadStatus;

  // Genre filter
  genres?: string[];

  // Watchlist filter
  watchlist_only?: boolean;

  // Sorting
  sort_by?: string;
  sort_order?: "asc" | "desc";
}
