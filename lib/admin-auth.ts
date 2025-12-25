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
    return userStr ? JSON.stringify(userStr) : null
  },

  isAuthenticated: (): boolean => {
    return !!adminAuth.getToken()
  },
}
