# Spring Boot Backend API Documentation

This document outlines all the REST API endpoints required for the Peak Kinetics Physical Therapy application to integrate with your Spring Boot backend.

## Base Configuration

**Base URL:** `http://localhost:8080/api` (configurable via `NEXT_PUBLIC_API_BASE_URL`)

**Authentication:** Most admin endpoints require Bearer token authentication.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {token}  // For protected routes
```

---

## 1. Authentication APIs

### 1.1 Admin Login
**Endpoint:** `POST /admin/auth/login`

**Description:** Authenticates an admin user and returns a JWT token.

**Request Body:**
```json
{
  "email": "admin@peakkinetics.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "admin-001",
    "email": "admin@peakkinetics.com",
    "name": "Sarah Johnson",
    "role": "Administrator",
    "lastLogin": "2024-01-15T10:30:00Z"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

### 1.2 Admin Logout
**Endpoint:** `POST /admin/auth/logout`

**Description:** Invalidates the admin's session token.

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 1.3 Verify Token
**Endpoint:** `GET /admin/auth/verify`

**Description:** Verifies if the current token is valid.

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "valid": true,
  "user": {
    "id": "admin-001",
    "email": "admin@peakkinetics.com",
    "name": "Sarah Johnson",
    "role": "Administrator"
  }
}
```

---

## 2. Reviews APIs

### 2.1 Get All Reviews
**Endpoint:** `GET /reviews`

**Description:** Retrieves all published reviews (public endpoint).

**Query Parameters:**
- `status` (optional): Filter by status (`published`, `draft`)
- `limit` (optional): Number of reviews to return
- `offset` (optional): Pagination offset

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "review-001",
      "name": "John Smith",
      "role": "Patient",
      "rating": 5,
      "text": "Outstanding care! The team at Peak Kinetics helped me recover...",
      "fullText": "Outstanding care! The team at Peak Kinetics helped me recover from a sports injury...",
      "date": "Jan 15, 2024",
      "treatment": "Sports Rehabilitation",
      "image": "/happy-patient-headshot.jpg",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 156,
  "page": 1,
  "pageSize": 20
}
```

### 2.2 Create Review
**Endpoint:** `POST /reviews`

**Description:** Creates a new review (public endpoint for customer submissions).

**Request Body:**
```json
{
  "name": "John Smith",
  "role": "Patient",
  "rating": 5,
  "text": "Great experience!",
  "fullText": "Great experience with the therapy team...",
  "image": "/placeholder.svg"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Thank you for your review!",
  "data": {
    "id": "review-123",
    "name": "John Smith",
    "rating": 5,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Name and rating are required"
}
```

### 2.3 Get Single Review (Admin)
**Endpoint:** `GET /reviews/{reviewId}`

**Description:** Retrieves a single review by ID.

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "id": "review-001",
  "name": "John Smith",
  "rating": 5,
  "text": "Outstanding care!",
  "fullText": "Outstanding care! The team at Peak Kinetics...",
  "date": "Jan 15, 2024",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 2.4 Delete Review (Admin)
**Endpoint:** `DELETE /reviews/{reviewId}`

**Description:** Deletes a review.

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

### 2.5 Send Review Request (Admin)
**Endpoint:** `POST /admin/reviews/send-request`

**Description:** Sends a review request email/SMS to a client.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "clientName": "Jane Doe",
  "email": "jane.doe@example.com",
  "phone": "+1-737-368-2653",
  "message": "We'd love to hear about your experience with Peak Kinetics!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Review request sent successfully to Jane Doe",
  "sentVia": ["email", "sms"],
  "reviewUrl": "https://peakkinetics.com/review?token=abc123"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Email or phone number is required"
}
```

### 2.6 Import Reviews from CSV (Admin)
**Endpoint:** `POST /admin/reviews/import`

**Description:** Imports reviews from a CSV file with healthcare survey data.

**Headers:** 
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
file: [CSV File]
```

**CSV Format Expected:**
The CSV should have these headers:
- Patient Account Number
- Patient First Name
- Patient Last Name
- Case Title
- Case Facility
- Case Therapist
- Case Status
- Survey Sent Date
- Response
- Clinic NPS
- Provider NPS
- Likelihood to Receive Specialist Care
- Discharge Date
- Survey Completion Date
- Is Invalid
- Comments

**The backend should extract:**
- `Patient First Name` + `Patient Last Name` → `name`
- `Comments` → `text` and `fullText`
- `Survey Completion Date` → `date`
- `Clinic NPS` → Convert to 1-5 star rating (NPS/2)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully imported 45 reviews",
  "imported": 45,
  "skipped": 3,
  "errors": [
    {
      "row": 12,
      "reason": "Missing required fields"
    }
  ]
}
```

---

## 3. Messages APIs

### 3.1 Create Message
**Endpoint:** `POST /messages`

**Description:** Creates a new contact message (public endpoint).

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-737-368-2653",
  "address": "123 Main St, Round Rock, TX 78681",
  "message": "I would like to schedule an appointment..."
}
```

**Validation Rules:**
- `email` (required): Must be valid email format
- `message` (required): Minimum 10 characters
- `firstName`, `lastName`, `phone`, `address` (optional)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Message sent successfully! We'll respond within 2 hours.",
  "data": {
    "id": "msg-123",
    "email": "john.doe@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Email and message are required"
}
```

### 3.2 Get All Messages (Admin)
**Endpoint:** `GET /admin/messages`

**Description:** Retrieves all contact messages.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status` (optional): Filter by read status (`read`, `unread`, `all`)
- `limit` (optional): Number of messages to return
- `offset` (optional): Pagination offset

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "msg-001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1-737-368-2653",
      "address": "123 Main St, Round Rock, TX 78681",
      "message": "I would like to schedule an appointment for sports injury rehabilitation...",
      "read": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 24,
  "unread": 8
}
```

### 3.3 Mark Message as Read (Admin)
**Endpoint:** `PATCH /admin/messages/{messageId}/read`

**Description:** Marks a message as read.

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Message marked as read"
}
```

### 3.4 Delete Message (Admin)
**Endpoint:** `DELETE /admin/messages/{messageId}`

**Description:** Deletes a message.

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

---

## 4. Blog APIs

### 4.1 Get All Blog Posts
**Endpoint:** `GET /blog`

**Description:** Retrieves blog posts (public for published, admin for all).

**Query Parameters:**
- `status` (optional): Filter by status (`published`, `draft`, `all`)
- `slug` (optional): Get post by slug
- `limit` (optional): Number of posts to return
- `offset` (optional): Pagination offset
- `tags` (optional): Comma-separated list of tags to filter by

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "post-001",
      "title": "5 Exercises for Lower Back Pain Relief",
      "slug": "5-exercises-lower-back-pain",
      "excerpt": "Discover effective exercises to alleviate lower back pain and improve mobility.",
      "content": "# Introduction\n\nLower back pain affects millions...",
      "featuredImage": "https://storage.example.com/blog/lower-back-exercises.jpg",
      "status": "published",
      "tags": ["back pain", "exercises", "wellness"],
      "author": {
        "id": "admin-001",
        "name": "Sarah Johnson"
      },
      "publishedAt": "2024-01-15T10:00:00Z",
      "createdAt": "2024-01-14T15:30:00Z",
      "updatedAt": "2024-01-15T09:45:00Z"
    }
  ],
  "total": 12,
  "page": 1,
  "pageSize": 10
}
```

### 4.2 Get Single Blog Post
**Endpoint:** `GET /blog/{postId}` or `GET /blog?slug={slug}`

**Description:** Retrieves a single blog post by ID or slug.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "post-001",
    "title": "5 Exercises for Lower Back Pain Relief",
    "slug": "5-exercises-lower-back-pain",
    "excerpt": "Discover effective exercises...",
    "content": "# Introduction\n\nLower back pain...",
    "featuredImage": "https://storage.example.com/blog/image.jpg",
    "status": "published",
    "tags": ["back pain", "exercises"],
    "publishedAt": "2024-01-15T10:00:00Z"
  }
}
```

### 4.3 Create Blog Post (Admin)
**Endpoint:** `POST /admin/blog`

**Description:** Creates a new blog post.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "title": "5 Exercises for Lower Back Pain Relief",
  "slug": "5-exercises-lower-back-pain",
  "excerpt": "Discover effective exercises to alleviate lower back pain.",
  "content": "# Introduction\n\nLower back pain affects millions of people...",
  "featuredImage": "https://storage.example.com/blog/image.jpg",
  "status": "published",
  "tags": ["back pain", "exercises", "wellness"]
}
```

**Validation Rules:**
- `title` (required): 5-200 characters
- `slug` (required): Unique, URL-friendly string
- `content` (required): Minimum 100 characters
- `excerpt` (optional): Maximum 300 characters
- `status` (required): Either "published" or "draft"
- `tags` (optional): Array of strings

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Blog post created successfully",
  "data": {
    "id": "post-123",
    "title": "5 Exercises for Lower Back Pain Relief",
    "slug": "5-exercises-lower-back-pain",
    "status": "published",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Slug already exists"
}
```

### 4.4 Update Blog Post (Admin)
**Endpoint:** `PUT /admin/blog/{postId}`

**Description:** Updates an existing blog post.

**Headers:** `Authorization: Bearer {token}`

**Request Body:** Same as Create Blog Post

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Blog post updated successfully",
  "data": {
    "id": "post-001",
    "title": "5 Exercises for Lower Back Pain Relief",
    "updatedAt": "2024-01-15T11:30:00Z"
  }
}
```

### 4.5 Delete Blog Post (Admin)
**Endpoint:** `DELETE /admin/blog/{postId}`

**Description:** Deletes a blog post.

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Blog post deleted successfully"
}
```

### 4.6 Upload Blog Image (Admin)
**Endpoint:** `POST /admin/blog/upload`

**Description:** Uploads an image for blog posts.

**Headers:** 
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
image: [Image File]
```

**Accepted Formats:** JPG, PNG, WebP, GIF
**Max Size:** 5MB

**Response (200 OK):**
```json
{
  "success": true,
  "url": "https://storage.example.com/blog/images/abc123.jpg",
  "filename": "abc123.jpg",
  "size": 245678,
  "contentType": "image/jpeg"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "File size exceeds 5MB limit"
}
```

---

## 5. Error Handling

All API endpoints should follow consistent error response formats:

### Standard Error Response
```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Authenticated but not authorized
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate slug)
- `422 Unprocessable Entity`: Validation failed
- `500 Internal Server Error`: Server error

---

## 6. Security Considerations

### Authentication
- Use JWT tokens with expiration (recommended: 24 hours)
- Refresh tokens should be implemented for long sessions
- Store tokens securely (HttpOnly cookies for production)

### Authorization
- All `/admin/*` endpoints require authentication
- Validate user roles before allowing access
- Implement rate limiting on public endpoints

### Data Validation
- Sanitize all user inputs to prevent XSS attacks
- Validate email formats, phone numbers, and URLs
- Limit request payload sizes
- Implement CSRF protection

### CORS Configuration
In development, allow:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

In production:
```
Access-Control-Allow-Origin: https://peakkinetics.com
```

---

## 7. Database Schema Recommendations

### Admin Users Table
```sql
CREATE TABLE admin_users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Reviews Table
```sql
CREATE TABLE reviews (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) DEFAULT 'Patient',
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  full_text TEXT,
  date VARCHAR(50),
  treatment VARCHAR(255),
  image VARCHAR(500),
  status VARCHAR(20) DEFAULT 'published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id VARCHAR(36) PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Blog Posts Table
```sql
CREATE TABLE blog_posts (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image VARCHAR(500),
  status VARCHAR(20) DEFAULT 'draft',
  author_id VARCHAR(36),
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES admin_users(id)
);
```

### Blog Tags Table (Many-to-Many)
```sql
CREATE TABLE blog_tags (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blog_post_tags (
  post_id VARCHAR(36),
  tag_id VARCHAR(36),
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES blog_tags(id) ON DELETE CASCADE
);
```

---

## 8. Testing the APIs

### Using cURL

**Test Authentication:**
```bash
curl -X POST http://localhost:8080/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@peakkinetics.com","password":"admin123"}'
```

**Test Create Review:**
```bash
curl -X POST http://localhost:8080/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","rating":5,"text":"Great service!","fullText":"Great service! Highly recommend."}'
```

**Test Get Reviews:**
```bash
curl http://localhost:8080/api/reviews
```

**Test Admin Endpoint:**
```bash
curl -X GET http://localhost:8080/api/admin/messages \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 9. Frontend Configuration

The frontend uses environment variables for API configuration:

**.env.local file:**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_DEV_MODE=false
```

**Development Mode:**
- Set `NEXT_PUBLIC_DEV_MODE=true` to use mock data (no backend required)
- Set `NEXT_PUBLIC_DEV_MODE=false` to connect to Spring Boot backend

---

## 10. Deployment Checklist

### Backend (Spring Boot)
- [ ] Configure CORS to allow frontend domain
- [ ] Set up JWT secret key (store in environment variables)
- [ ] Configure database connection
- [ ] Set up file storage for images (S3, local storage, etc.)
- [ ] Implement email service for review requests
- [ ] Implement SMS service (optional) for review requests
- [ ] Set up logging and monitoring
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up rate limiting
- [ ] Configure session management

### Frontend (Next.js)
- [ ] Set `NEXT_PUBLIC_API_BASE_URL` to production backend URL
- [ ] Set `NEXT_PUBLIC_DEV_MODE=false`
- [ ] Build static files: `npm run build`
- [ ] Export static site: `next export` (if using static export)
- [ ] Copy `out/` directory to Spring Boot's `src/main/resources/static`

---

## Support

For questions or issues with API integration, please contact the development team or refer to the main project README.

**Last Updated:** January 2024
**API Version:** 1.0.0
