export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"

export const API_ENDPOINTS = {
  reviews: {
    list: `${API_BASE_URL}/reviews`,
    create: `${API_BASE_URL}/reviews`,
  },
  messages: {
    create: `${API_BASE_URL}/messages`,
  },
} as const
