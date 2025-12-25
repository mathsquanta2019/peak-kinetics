"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adminAuth } from "@/lib/admin-auth"
import Image from "next/image"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (adminAuth.isAuthenticated()) {
      router.replace("/admin/dashboard")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const user = await adminAuth.login(email, password)

    if (user) {
      router.replace("/admin/dashboard")
    } else {
      setError("Invalid credentials. Please try again.")
    }

    setLoading(false)
  }

  if (adminAuth.isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex justify-center mb-8">
            <Image
              src="/placeholder.svg?height=80&width=200"
              alt="Peak Kinetics Logo"
              width={200}
              height={80}
              className="h-16 w-auto"
            />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
            <p className="text-gray-600">Sign in to manage your practice</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@peakkinetics.com"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-11"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">{error}</div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-sky-600 hover:bg-sky-700 text-white font-medium"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {process.env.NEXT_PUBLIC_DEV_MODE === "true" && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-900 mb-2">Dev Mode - Test Credentials:</p>
              <p className="text-xs text-blue-800">admin@peakkinetics.com / admin123</p>
              <p className="text-xs text-blue-800">john@peakkinetics.com / john123</p>
              <p className="text-xs text-blue-800">emily@peakkinetics.com / emily123</p>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link href="/admin/forgot-password" className="text-sky-600 hover:text-sky-700 font-medium">
              Forgot your password?
            </Link>
          </p>

          <p className="mt-2 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/admin/register" className="text-sky-600 hover:text-sky-700 font-medium">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
