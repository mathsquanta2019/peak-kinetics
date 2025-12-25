"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { API_ENDPOINTS } from "@/lib/api-config"
import { useState, useEffect } from "react"
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { use } from "react"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage?: string
  author: string
  publishedAt: string
  tags: string[]
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPost()
  }, [slug])

  const fetchPost = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.blog.list}?slug=${slug}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data)
      }
    } catch (error) {
      console.error("Failed to fetch post:", error)
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
          <p className="text-gray-500">Loading article...</p>
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
          <p className="text-gray-500 text-lg mb-6">Article not found</p>
          <Link href="/blog">
            <Button className="bg-sky-600 hover:bg-sky-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
        <article className="container mx-auto px-4 max-w-4xl">
          <Link href="/blog">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          {post.featuredImage && (
            <div className="relative h-96 rounded-2xl overflow-hidden mb-8">
              <Image
                src={post.featuredImage || "/placeholder.svg"}
                alt={post.title}
                fill
                className="object-cover"
                sizes="1200px"
                priority
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <Badge key={tag} className="bg-sky-100 text-sky-700 hover:bg-sky-200">
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">{post.title}</h1>

          <div className="flex items-center justify-between pb-8 mb-8 border-b border-gray-200">
            <div className="flex items-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>5 min read</span>
              </div>
              <span>By {post.author}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</div>
          </div>

          <div className="mt-16 p-8 bg-sky-50 rounded-2xl border border-sky-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Your Recovery Journey?</h3>
            <p className="text-gray-700 mb-6">
              Our expert team at Peak Kinetics is here to help you achieve your health and wellness goals.
            </p>
            <Link href="/#contact">
              <Button className="bg-sky-600 hover:bg-sky-700">Schedule Your Consultation</Button>
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
