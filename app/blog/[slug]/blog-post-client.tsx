"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { API_ENDPOINTS } from "@/lib/api-config"
import { useState, useEffect } from "react"
import { Calendar, Clock, ArrowLeft, Share2, User } from "lucide-react"
import Link from "next/link"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage?: string
  author: {
    id: number
    name: string
  }
  publishedAt: string
  tags: string[]
}

export default function BlogPostClient({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPost()
  }, [slug])

  const fetchPost = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.blog.list}/slug/${slug}`)
      console.log("[v0] Fetching blog post from:", `${API_ENDPOINTS.blog.list}/slug/${slug}`)

      if (response.ok) {
        const result = await response.json()
        console.log("[v0] Blog post API response:", result)
        if (result.success && result.data) {
          setPost(result.data)
        }
      } else {
        console.error("[v0] Failed to fetch blog post. Status:", response.status)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch post:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href,
      })
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sky-200 border-t-sky-600 mb-4" />
            <p className="text-gray-500 text-lg">Loading article...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!post) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-16 flex flex-col items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <ArrowLeft className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Article Not Found</h2>
            <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
            <Link href="/blog">
              <Button className="bg-sky-600 hover:bg-sky-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-24 pb-16">
        <article className="container mx-auto px-4 max-w-4xl">
          <Link href="/blog">
            <Button variant="ghost" className="mb-8 hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <Badge key={tag} className="bg-sky-100 text-sky-700 hover:bg-sky-200 border-sky-200">
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">{post.title}</h1>

          <div className="flex items-center gap-6 text-gray-600 pb-8 mb-8 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-sky-600" />
              <span className="font-medium">{post.author.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-sky-600" />
              <span>
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-sky-600" />
              <span>{Math.ceil(post.content.split(" ").length / 200)} min read</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleShare} className="ml-auto bg-transparent">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          {post.featuredImage && (
            <div className="relative h-96 rounded-2xl overflow-hidden mb-12 shadow-lg">
              <img
                src={post.featuredImage || "/placeholder.svg"}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="prose prose-lg prose-sky max-w-none">
            <div className="text-gray-800 leading-relaxed space-y-6 text-lg" style={{ whiteSpace: "pre-wrap" }}>
              {post.content.split("\n").map((paragraph, index) =>
                paragraph.trim() ? (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ) : null,
              )}
            </div>
          </div>

          <div className="mt-16 p-8 bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl border border-sky-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Your Recovery Journey?</h3>
            <p className="text-gray-700 mb-6 text-lg">
              Our expert team at Peak Kinetics is here to help you achieve your health and wellness goals.
            </p>
            <Link href="/#contact">
              <Button className="bg-sky-600 hover:bg-sky-700 h-12 px-8">Schedule Your Consultation</Button>
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
