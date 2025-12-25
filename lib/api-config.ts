export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"

export const API_ENDPOINTS = {
  reviews: {
    list: `${API_BASE_URL}/reviews`,
    create: `${API_BASE_URL}/reviews`,
    import: `${API_BASE_URL}/admin/reviews/import`,
    sendRequest: `${API_BASE_URL}/admin/reviews/send-request`,
  },
  messages: {
    create: `${API_BASE_URL}/messages`,
    list: `${API_BASE_URL}/admin/messages`,
  },
  blog: {
    list: `${API_BASE_URL}/blog`,
    create: `${API_BASE_URL}/admin/blog`,
    update: `${API_BASE_URL}/admin/blog`,
    delete: `${API_BASE_URL}/admin/blog`,
    upload: `${API_BASE_URL}/admin/blog/upload`,
  },
  auth: {
    login: `${API_BASE_URL}/admin/auth/login`,
    logout: `${API_BASE_URL}/admin/auth/logout`,
    verify: `${API_BASE_URL}/admin/auth/verify`,
    register: `${API_BASE_URL}/admin/auth/register`,
    forgotPassword: `${API_BASE_URL}/admin/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/admin/auth/reset-password`,
  },
} as const
