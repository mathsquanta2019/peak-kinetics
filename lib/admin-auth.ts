"use client"

import { API_ENDPOINTS } from "./api-config"
import { mockDB } from "./mock-data/mock-db"

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

const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true"

export const adminAuth = {
  login: async (email: string, password: string): Promise<AdminUser | null> => {
    if (DEV_MODE) {
      const admin = mockDB.admins.authenticate(email, password)
      if (admin) {
        const user: AdminUser = {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          lastLogin: admin.lastLogin,
        }
        if (typeof window !== "undefined") {
          localStorage.setItem("admin_token", `dev-token-${admin.id}`)
          localStorage.setItem("admin_user", JSON.stringify(user))
        }
        // Update last login for next time
        mockDB.admins.updateLastLogin(admin.id)
        return user
      }
      return null
    }

    // Production mode - use Spring Boot backend
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

  // Adding register functionality
  register: async (data: RegisterData): Promise<boolean> => {
    if (DEV_MODE) {
      return mockDB.admins.register(data)
    }

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

  // Adding forgot password functionality
  requestPasswordReset: async (email: string): Promise<boolean> => {
    if (DEV_MODE) {
      // In dev mode, just simulate success
      const admin = mockDB.admins.findByEmail(email)
      return !!admin
    }

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

  // Adding reset password functionality
  resetPassword: async (token: string, newPassword: string): Promise<boolean> => {
    if (DEV_MODE) {
      // In dev mode, just simulate success
      return true
    }

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
