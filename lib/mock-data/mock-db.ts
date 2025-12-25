// Centralized mock database for dev mode
// This simulates a real backend database with in-memory storage

import type { Review } from "./reviews"

export interface Admin {
  id: string
  email: string
  name: string
  password: string
  role: string
  lastLogin?: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  authorId: string
  featuredImage?: string
  tags: string[]
  status: "draft" | "published"
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

// Mock Admin Users
const mockAdmins: Admin[] = [
  {
    id: "admin-1",
    email: "admin@peakkinetics.com",
    password: "admin123",
    name: "Dr. Sarah Johnson",
    role: "Administrator",
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: "admin-2",
    email: "john@peakkinetics.com",
    password: "john123",
    name: "John Martinez",
    role: "Physical Therapist",
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: "admin-3",
    email: "emily@peakkinetics.com",
    password: "emily123",
    name: "Emily Chen",
    role: "Practice Manager",
    lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
]

// Mock Reviews Storage
const mockReviewsStorage: Review[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    role: "Marathon Runner",
    text: "After months of chronic knee pain, Peak Kinetics got me back to running pain-free. Their personalized approach made all the difference!",
    fullText:
      "After months of chronic knee pain that kept me from training, I found Peak Kinetics. From the very first session, I knew I was in expert hands. The team took time to understand not just my injury, but my goals as a marathon runner. Through a combination of manual therapy, targeted exercises, and education on proper form, they got me back to running pain-free within 8 weeks. What impressed me most was their personalized approach - every session was tailored to my progress. I'm now training for my next marathon with confidence!",
    rating: 5,
    image: "/young-female-athlete-headshot.jpg",
    date: "2 weeks ago",
    treatment: "Sports Rehabilitation",
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "Construction Worker",
    text: "The team here truly cares. My back injury was affecting my work and family life. Now I'm stronger than ever!",
    fullText:
      "I injured my back on a construction site and was told I might need surgery. Before making that decision, I came to Peak Kinetics for a second opinion. Best decision I ever made! They developed a comprehensive treatment plan that addressed the root cause of my pain, not just the symptoms. Through manual therapy, core strengthening, and movement re-education, I avoided surgery completely. Not only am I back to work full-time, but I'm actually stronger and more aware of my body mechanics than before the injury. The team here truly cares about their patients and goes above and beyond.",
    rating: 5,
    image: "/middle-aged-construction-worker-headshot.jpg",
    date: "1 month ago",
    treatment: "Pain Management",
  },
  {
    id: "3",
    name: "Robert Johnson",
    role: "Retiree",
    text: "At 72, I thought my mobility issues were just part of aging. Peak Kinetics proved me wrong. I'm now more active than I've been in years!",
    fullText:
      "At 72 years old, I had accepted that stiffness, balance issues, and limited mobility were just part of getting older. My daughter convinced me to try Peak Kinetics, and I'm so glad she did. The therapists specialized in geriatric care took a patient, understanding approach. They never pushed too hard but consistently challenged me to improve. Through balance training, flexibility work, and strength building, I've regained abilities I thought were gone forever. I can now play with my grandchildren, garden, and even started playing golf again. They didn't just treat my symptoms - they gave me my independence and quality of life back.",
    rating: 5,
    image: "/elderly-man-smiling-headshot.jpg",
    date: "3 weeks ago",
    treatment: "Geriatric Care",
  },
  {
    id: "4",
    name: "Jennifer Adams",
    role: "Busy Mom",
    text: "Balancing three kids and chronic shoulder pain was impossible. The team worked around my schedule and had me pain-free in weeks.",
    fullText:
      "As a mother of three young children, I was struggling with chronic shoulder pain that made everything from lifting my toddler to doing household chores painful. I kept putting off treatment because I couldn't find time. Peak Kinetics worked with my busy schedule, offering early morning and evening appointments. The therapists were efficient but thorough, and they taught me exercises I could do at home while watching the kids. Within 6 weeks, my shoulder pain was completely gone. They also educated me on body mechanics for daily activities, which has prevented other issues from developing. I'm so grateful for their flexibility and expertise!",
    rating: 5,
    image: "/young-mother-headshot.jpg",
    date: "2 months ago",
    treatment: "Orthopedic Therapy",
  },
]

// Mock Messages Storage
interface Message {
  id: string
  firstName?: string
  lastName?: string
  email: string
  phone?: string
  address?: string
  message: string
  createdAt: string
  read: boolean
}

const mockMessagesStorage: Message[] = [
  {
    id: "msg-1",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@email.com",
    phone: "(555) 123-4567",
    address: "123 Main St, Denver, CO",
    message:
      "I'm interested in scheduling a consultation for lower back pain that I've been experiencing for the past few months. What are your available times next week?",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "msg-2",
    firstName: "Maria",
    lastName: "Garcia",
    email: "maria.g@email.com",
    phone: "(555) 234-5678",
    address: "456 Oak Ave, Denver, CO",
    message: "Do you accept Blue Cross Blue Shield insurance? I need physical therapy after my recent knee surgery.",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: "msg-3",
    firstName: "David",
    lastName: "Lee",
    email: "david.lee@email.com",
    phone: "(555) 345-6789",
    address: "789 Pine Rd, Denver, CO",
    message:
      "I'm a competitive runner and have been dealing with recurring shin splints. Can you help with sports rehabilitation?",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
]

// Mock Blog Posts Storage
const mockBlogPostsStorage: BlogPost[] = [
  {
    id: "blog-1",
    title: "5 Essential Stretches for Desk Workers",
    slug: "5-essential-stretches-for-desk-workers",
    excerpt:
      "Combat the effects of prolonged sitting with these simple yet effective stretches you can do at your desk.",
    content:
      "Working at a desk for extended periods can lead to muscle tightness, poor posture, and pain. Here are five essential stretches...",
    author: "Dr. Sarah Johnson",
    authorId: "admin-1",
    featuredImage: "/person-stretching-desk.png",
    tags: ["Wellness", "Office Health", "Stretching"],
    status: "published",
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Centralized Mock Database API
export const mockDB = {
  // Admin Methods
  admins: {
    findByEmail: (email: string): Admin | undefined => {
      return mockAdmins.find((admin) => admin.email === email)
    },
    authenticate: (email: string, password: string): Admin | null => {
      const admin = mockAdmins.find((a) => a.email === email && a.password === password)
      if (admin) {
        // Update last login
        admin.lastLogin = new Date().toISOString()
        return { ...admin, password: "" } // Don't return password
      }
      return null
    },
    updateLastLogin: (adminId: string): void => {
      const admin = mockAdmins.find((a) => a.id === adminId)
      if (admin) {
        admin.lastLogin = new Date().toISOString()
      }
    },
  },

  // Review Methods
  reviews: {
    getAll: (): Review[] => [...mockReviewsStorage],
    getById: (id: string): Review | undefined => mockReviewsStorage.find((r) => r.id === id),
    create: (review: Omit<Review, "id">): Review => {
      const newReview: Review = {
        ...review,
        id: `review-${Date.now()}`,
      }
      mockReviewsStorage.push(newReview)
      return newReview
    },
    update: (id: string, updates: Partial<Review>): Review | null => {
      const index = mockReviewsStorage.findIndex((r) => r.id === id)
      if (index !== -1) {
        mockReviewsStorage[index] = { ...mockReviewsStorage[index], ...updates }
        return mockReviewsStorage[index]
      }
      return null
    },
    delete: (id: string): boolean => {
      const index = mockReviewsStorage.findIndex((r) => r.id === id)
      if (index !== -1) {
        mockReviewsStorage.splice(index, 1)
        return true
      }
      return false
    },
  },

  // Message Methods
  messages: {
    getAll: (): Message[] =>
      [...mockMessagesStorage].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    getById: (id: string): Message | undefined => mockMessagesStorage.find((m) => m.id === id),
    create: (message: Omit<Message, "id" | "createdAt" | "read">): Message => {
      const newMessage: Message = {
        ...message,
        id: `msg-${Date.now()}`,
        createdAt: new Date().toISOString(),
        read: false,
      }
      mockMessagesStorage.unshift(newMessage)
      return newMessage
    },
    markAsRead: (id: string): Message | null => {
      const message = mockMessagesStorage.find((m) => m.id === id)
      if (message) {
        message.read = true
        return message
      }
      return null
    },
    delete: (id: string): boolean => {
      const index = mockMessagesStorage.findIndex((m) => m.id === id)
      if (index !== -1) {
        mockMessagesStorage.splice(index, 1)
        return true
      }
      return false
    },
  },

  // Blog Methods
  blog: {
    getAll: (): BlogPost[] =>
      [...mockBlogPostsStorage].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    getPublished: (): BlogPost[] =>
      mockBlogPostsStorage
        .filter((post) => post.status === "published")
        .sort(
          (a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime(),
        ),
    getById: (id: string): BlogPost | undefined => mockBlogPostsStorage.find((p) => p.id === id),
    getBySlug: (slug: string): BlogPost | undefined => mockBlogPostsStorage.find((p) => p.slug === slug),
    create: (post: Omit<BlogPost, "id" | "createdAt" | "updatedAt">): BlogPost => {
      const newPost: BlogPost = {
        ...post,
        id: `blog-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockBlogPostsStorage.push(newPost)
      return newPost
    },
    update: (id: string, updates: Partial<BlogPost>): BlogPost | null => {
      const index = mockBlogPostsStorage.findIndex((p) => p.id === id)
      if (index !== -1) {
        mockBlogPostsStorage[index] = {
          ...mockBlogPostsStorage[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        }
        return mockBlogPostsStorage[index]
      }
      return null
    },
    delete: (id: string): boolean => {
      const index = mockBlogPostsStorage.findIndex((p) => p.id === id)
      if (index !== -1) {
        mockBlogPostsStorage.splice(index, 1)
        return true
      }
      return false
    },
  },
}
