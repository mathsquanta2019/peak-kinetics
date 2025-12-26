"use client"

import { API_ENDPOINTS } from "./api-config"

export interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  lastLogin?: string
}

interface RegisterData {
  title: string
  firstName: string
  lastName: string
  email: string
  password: string
}

export const adminAuth = {
  login: async (email: string, password: string): Promise<AdminUser | null> => {
    try {
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) return null

      const data = await response.json()
      if (data.token) {
        localStorage.setItem("admin_token", data.token)
        localStorage.setItem("admin_user", JSON.stringify(data.user))
        return data.user
      }
      return null
    } catch (error) {
      console.error("Login error:", error)
      return null
    }
  },

  register: async (data: RegisterData): Promise<boolean> => {
    try {
      const response = await fetch(API_ENDPOINTS.auth.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      return response.ok
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  },

  requestPasswordReset: async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(API_ENDPOINTS.auth.forgotPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      return response.ok
    } catch (error) {
      console.error("Password reset request error:", error)
      return false
    }
  },

  resetPassword: async (token: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await fetch(API_ENDPOINTS.auth.resetPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      })

      return response.ok
    } catch (error) {
      console.error("Password reset error:", error)
      return false
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token")
      localStorage.removeItem("admin_user")
    }
  },

  getToken: (): string | null => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("admin_token")
  },

  getUser: (): AdminUser | null => {
    if (typeof window === "undefined") return null
    const userStr = localStorage.getItem("admin_user")
    return userStr ? JSON.parse(userStr) : null
  },

  isAuthenticated: (): boolean => {
    return !!adminAuth.getToken()
  },
}
