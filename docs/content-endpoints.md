# Content API Endpoints

This document describes the available content API endpoints and how to use them.

## Base Endpoints

### `/content`

- **Method**: GET
- **Description**: Fetch content list with optional filters
- **Query Parameters**: See `ContentQueryParams` interface
- **Usage**: `ContentService.getContents(params)`

### `/content/{id}`

- **Method**: GET
- **Description**: Fetch single content by ID
- **Usage**: `ContentService.getContentById(id)`

### `/content/{slug}`

- **Method**: GET
- **Description**: Fetch single content by slug
- **Usage**: `ContentService.getContentBySlug(slug)`

### `/content/{id}/trailer`

- **Method**: GET
- **Description**: Get signed trailer URL by content ID
- **Usage**: `ContentService.getTrailerSignedUrl(id)`

### `/content/{id}/video`

- **Method**: GET
- **Description**: Get signed video URL by content ID
- **Usage**: `ContentService.getVideoSignedUrl(id)`

## New Specialized Endpoints

### `/content/anticipate`

- **Method**: GET
- **Description**: Fetch anticipated content (upcoming releases)
- **Usage**: `ContentService.getAnticipatedContent()`
- **Features**:
  - Cached responses for better performance
  - Automatically handles loading states
  - Returns `ContentListResponse`

### `/content/featured`

- **Method**: GET
- **Description**: Fetch featured content
- **Usage**: `ContentService.getFeaturedContent()`
- **Features**:
  - Cached responses for better performance
  - Automatically handles loading states
  - Returns `ContentListResponse`

### `/content/recommended`

- **Method**: GET
- **Description**: Fetch recommended content for the user
- **Usage**: `ContentService.getRecommendedContent()`
- **Features**:
  - Personalized recommendations
  - Returns `ContentListResponse`

### `/content/{slug}/similar`

- **Method**: GET
- **Description**: Fetch similar content based on a specific content slug
- **Usage**: `ContentService.getSimilarContent(slug)`
- **Features**:
  - Content-based similarity matching
  - Useful for "You might also like" sections
  - Returns `ContentListResponse`

### `/content/{slug}/trailer-url`

- **Method**: GET
- **Description**: Get trailer URL by content slug (alternative to ID-based endpoint)
- **Usage**: `ContentService.getTrailerUrlBySlug(slug)`
- **Features**:
  - Slug-based access (more user-friendly URLs)
  - Returns `SignedUrlResponse` with expiration info

## Response Types

### ContentListResponse

```typescript
interface ContentListResponse {
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
```

### SingleContentResponse

```typescript
interface SingleContentResponse {
  message: string;
  data: Content;
}
```

### SignedUrlResponse

```typescript
interface SignedUrlResponse {
  message: string;
  url: string;
  expires_in_seconds: number;
}
```

## Usage Examples

### Fetch Featured Content

```typescript
import { ContentService } from "~/api/services/content.service";

const featuredContent = await ContentService.getFeaturedContent();
console.log(featuredContent.data); // Array of featured content
```

### Fetch Anticipated Content

```typescript
const anticipatedContent = await ContentService.getAnticipatedContent();
console.log(anticipatedContent.data); // Array of anticipated content
```

### Get Similar Content

```typescript
const similarContent = await ContentService.getSimilarContent("movie-slug");
console.log(similarContent.data); // Array of similar content
```

### Get Trailer URL by Slug

```typescript
const trailerResponse = await ContentService.getTrailerUrlBySlug("movie-slug");
console.log(trailerResponse.url); // Trailer URL
console.log(trailerResponse.expires_in_seconds); // URL expiration time
```

## Caching

The following endpoints implement automatic caching:

- `/content/anticipate` - Cached in localStorage
- `/content/featured` - Cached in localStorage

Cache keys are managed by the `LocalStorageService` and automatically invalidated when needed.

## Error Handling

All methods include proper error handling and will throw errors that can be caught and handled by the calling code:

```typescript
try {
  const content = await ContentService.getFeaturedContent();
  // Handle success
} catch (error) {
  // Handle error
  console.error("Failed to fetch featured content:", error);
}
```

## Migration Notes

If you're currently using the generic `getContents()` method with `is_featured: true` or `released_after` parameters, consider migrating to the new specialized endpoints:

**Before:**

```typescript
const featured = await ContentService.getContents({ is_featured: true });
```

**After:**

```typescript
const featured = await ContentService.getFeaturedContent();
```

The new endpoints provide better performance, caching, and clearer intent in your code.
