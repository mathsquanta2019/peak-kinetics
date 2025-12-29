"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, User } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-config"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface BlogPost {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string
  author: {
    id: number
    name: string
  }
  featuredImage?: string
  publishedDate: string
  status: string
  tags: string[]
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug

  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return

    const fetchPost = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log("[v0] Fetching blog post with slug:", slug)

        const response = await fetch(`${API_ENDPOINTS.blog.slug}/${slug}`)

        if (!response.ok) {
          throw new Error("Blog post not found")
        }

        const data = await response.json()
        console.log("[v0] Blog post data:", data)
        setPost(data)
      } catch (err) {
        console.error("[v0] Error fetching blog post:", err)
        setError(err instanceof Error ? err.message : "Failed to load blog post")
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || "The blog post you are looking for does not exist."}</p>
          <Link href="/blog" className="text-primary hover:underline">
            Return to Blog
          </Link>
        </div>
      </div>
    )
  }

  const readingTime = Math.ceil(post.content.split(" ").length / 200)

  return (
    <div className="min-h-screen bg-background">
      <article className="container max-w-4xl mx-auto px-4 py-12">
        <Link href="/blog" className="inline-flex items-center text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>

        {post.featuredImage && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.featuredImage || "/placeholder.svg"}
              alt={post.title}
              className="w-full h-[400px] object-cover"
            />
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-balance">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time>
                {new Date(post.publishedDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{readingTime} min read</span>
            </div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose prose-lg max-w-none">
          {post.content.split("\n").map(
            (paragraph, index) =>
              paragraph.trim() && (
                <p key={index} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ),
          )}
        </div>
      </article>
    </div>
  )
}
