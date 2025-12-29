"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Calendar, User, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  featuredImage?: string
  author: {
    id: number
    name: string
  }
  publishedAt: string
  tags: string[]
  content: string
}

interface BlogPostClientPageProps {
  initialPostData: BlogPost | null
  initialSlug: string
}

export function BlogPostClientPage({ initialPostData, initialSlug }: BlogPostClientPageProps) {
  const [post, setPost] = useState<BlogPost | null>(initialPostData)
  const [loading, setLoading] = useState(initialPostData === null) // Start loading if no initial data
  const [error, setError] = useState<string | null>(
    initialPostData === null && !initialSlug ? "Slug is missing." : null,
  )

  const slug = initialSlug

  useEffect(() => {
    // Only fetch if we don't have initial data or if the slug has changed (though slug shouldn't change in this setup)
    if (initialPostData === null && slug) {
      fetchPost()
    } else if (initialPostData !== null && post === null) {
      // If initial data was provided but somehow `post` became null, refetch.
      setPost(initialPostData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]) // Dependency on slug is important

  const fetchPost = async () => {
    const API_ENDPOINTS = {
      blog: {
        slug: `${process.env.NEXT_PUBLIC_API_URL}/api/blog`, // Example API endpoint
      },
    }
    try {
      setLoading(true)
      setError(null) // Clear previous errors
      const response = await fetch(`${API_ENDPOINTS.blog.slug}/${slug}`)

      if (response.ok) {
        const data = await response.json()
        setPost(data)
      } else {
        setError("Blog post not found")
      }
    } catch (error) {
      console.error("Error fetching blog post:", error)
      setError("Failed to load blog post")
    } finally {
      setLoading(false)
    }
  }

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.split(/\s+/).length
    const minutes = Math.ceil(words / wordsPerMinute)
    return minutes
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center pt-24">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">Loading article...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !post) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center pt-24">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-8">{error || "The blog post you're looking for doesn't exist."}</p>
            <Link href="/blog" className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium">
              <ArrowLeft className="h-5 w-5" />
              Back to Blog
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
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-20">
        <article className="container mx-auto px-4 max-w-4xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium mb-8 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to All Articles
          </Link>

          {post.featuredImage && (
            <div className="relative h-[400px] rounded-2xl overflow-hidden mb-8 shadow-xl">
              <img
                src={post.featuredImage || "/placeholder.svg"}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <header className="mb-12">
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-600 border-t border-b border-gray-200 py-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-sky-600" />
                <span className="font-medium">{post.author.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-sky-600" />
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-sky-600" />
                <span>{calculateReadingTime(post.content)} min read</span>
              </div>
            </div>
          </header>

          <div className="prose prose-lg max-w-none">
            {post.content.split("\n").map((paragraph, index) => {
              if (!paragraph.trim()) return null
              return (
                <p key={index} className="text-gray-700 leading-relaxed mb-6">
                  {paragraph}
                </p>
              )
            })}
          </div>

          <footer className="mt-16 pt-8 border-t border-gray-200">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Read More Articles
            </Link>
          </footer>
        </article>
      </main>
      <Footer />
    </>
  )
}
