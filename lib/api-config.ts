export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"

export const API_ENDPOINTS = {
  reviews: {
    list: `${API_BASE_URL}/reviews`,
    create: `${API_BASE_URL}/reviews`,
    import: `${API_BASE_URL}/reviews/admin/import`,
    sendRequest: `${API_BASE_URL}/reviews/admin/send-request`,
  },
  messages: {
    create: `${API_BASE_URL}/messages`,
    threads: `${API_BASE_URL}/messages/admin/threads`,
    getThread: (threadId: number) => `${API_BASE_URL}/messages/admin/thread/${threadId}`,
    reply: (threadId: number) => `${API_BASE_URL}/messages/thread/${threadId}/reply`,
    markAsRead: (messageId: number) => `${API_BASE_URL}/messages/admin/thread/${messageId}/read`,
    deleteThread: (threadId: number) => `${API_BASE_URL}/messages/admin/thread/${threadId}`,
    statistics: `${API_BASE_URL}/messages/admin/statistics`,
    search: (query: string) => `${API_BASE_URL}/messages/admin/threads/search?query=${encodeURIComponent(query)}`,
  },
  blog: {
    list: `${API_BASE_URL}/blog`,
    create: `${API_BASE_URL}/blog/admin`,
    update: `${API_BASE_URL}/blog/admin`,
    delete: `${API_BASE_URL}/blog/admin`,
    upload: `${API_BASE_URL}/blog/admin/upload`,
  },
  auth: {
    login: `${API_BASE_URL}/admin/auth/login`,
    logout: `${API_BASE_URL}/admin/auth/logout`,
    verify: `${API_BASE_URL}/admin/auth/verify`,
    register: `${API_BASE_URL}/admin/auth/register`,
    forgotPassword: `${API_BASE_URL}/admin/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/admin/auth/reset-password`,
    user: `${API_BASE_URL}/admin/auth/me`,
  },
} as const
