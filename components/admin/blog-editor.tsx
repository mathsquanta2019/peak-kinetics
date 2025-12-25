"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { API_ENDPOINTS } from "@/lib/api-config"
import { adminAuth } from "@/lib/admin-auth"
import { ArrowLeft, Save, Eye, Upload, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface BlogEditorProps {
  postId?: string
}

export function BlogEditor({ postId }: BlogEditorProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [featuredImage, setFeaturedImage] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")
  const [status, setStatus] = useState<"published" | "draft">("draft")
  const [tags, setTags] = useState("")

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId])

  useEffect(() => {
    if (title && !postId) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
      setSlug(generatedSlug)
    }
  }, [title, postId])

  const fetchPost = async () => {
    try {
      const token = adminAuth.getToken()
      const response = await fetch(`${API_ENDPOINTS.blog.list}/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const post = await response.json()
        setTitle(post.title)
        setSlug(post.slug)
        setExcerpt(post.excerpt)
        setContent(post.content)
        setFeaturedImage(post.featuredImage || "")
        setImagePreview(post.featuredImage || "")
        setStatus(post.status)
        setTags(post.tags.join(", "))
      }
    } catch (error) {
      console.error("Failed to fetch post:", error)
    }
  }

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return featuredImage

    try {
      const token = adminAuth.getToken()
      const formData = new FormData()
      formData.append("image", imageFile)

      const response = await fetch(API_ENDPOINTS.blog.upload, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        return data.url
      }
    } catch (error) {
      console.error("Failed to upload image:", error)
    }
    return null
  }

  const handleSubmit = async (publishNow = false) => {
    if (!title || !content) {
      showNotification("error", "Title and content are required")
      return
    }

    setLoading(true)

    try {
      let uploadedImageUrl = featuredImage
      if (imageFile) {
        const url = await uploadImage()
        if (url) uploadedImageUrl = url
      }

      const token = adminAuth.getToken()
      const postData = {
        title,
        slug,
        excerpt,
        content,
        featuredImage: uploadedImageUrl,
        status: publishNow ? "published" : status,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      }

      const url = postId ? `${API_ENDPOINTS.blog.update}/${postId}` : API_ENDPOINTS.blog.create
      const method = postId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      })

      if (response.ok) {
        showNotification("success", postId ? "Post updated successfully" : "Post created successfully")
        setTimeout(() => {
          router.push("/admin/blog")
        }, 1500)
      } else {
        showNotification("error", "Failed to save post")
      }
    } catch (error) {
      showNotification("error", "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg border-2 px-6 py-4 shadow-lg ${
            notification.type === "success"
              ? "border-emerald-500 bg-emerald-50 text-emerald-800"
              : "border-red-500 bg-red-50 text-red-800"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`h-2 w-2 rounded-full ${notification.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}
            />
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{postId ? "Edit Post" : "Create New Post"}</h2>
            <p className="text-gray-600 text-sm">Write and publish blog content</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {slug && (
            <Link href={`/blog/${slug}`} target="_blank">
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </Link>
          )}
          <Button variant="outline" onClick={() => handleSubmit(false)} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSubmit(true)} disabled={loading} className="bg-sky-600 hover:bg-sky-700">
            {loading ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title"
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="post-url-slug" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief description of the post"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content here... (Supports markdown)"
                  rows={20}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500">Supports basic markdown formatting</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Featured Image</h3>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <div className="relative h-48 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      fill
                      className="object-cover"
                      sizes="400px"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 bg-white hover:bg-gray-100"
                    onClick={() => {
                      setImagePreview("")
                      setImageFile(null)
                      setFeaturedImage("")
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-sky-400 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <Label htmlFor="image-upload" className="text-sm text-gray-600 cursor-pointer hover:text-sky-600">
                    Click to upload image
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Post Settings</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "published" | "draft")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="health, therapy, wellness"
                />
                <p className="text-xs text-gray-500">Separate tags with commas</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
