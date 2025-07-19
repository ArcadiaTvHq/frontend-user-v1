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

// Interactions interface
export interface Interactions {
  reactions: Record<string, any>;
  rating: {
    average: number;
    total: number;
  };
  comments_count: number;
  user: {
    reaction: null | string;
    rating: null | number;
  };
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
  trailer_video_uid: string | null;
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
  series: Series | null;
  movie: Movie | null;
  season: Season | null;
  episode: Episode | null;
  trailer: null;
  advert: null;
  interactions?: Interactions;
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
  released_before?: Date;
  released_after?: Date;
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
}
