import { Suspense } from "react"
import BlogPostClient from "./blog-post-client"

export const dynamicParams = false

export async function generateStaticParams() {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"
    const response = await fetch(`${API_BASE_URL}/blog?status=published&limit=100`)

    if (!response.ok) {
      console.log("[v0] Failed to fetch blog posts for static generation, returning empty array")
      return []
    }

    const result = await response.json()
    const posts = result.data || []

    console.log(`[v0] Generating static pages for ${posts.length} blog posts`)

    return posts.map((post: { slug: string }) => ({
      slug: post.slug,
    }))
  } catch (error) {
    console.error("[v0] Error generating static params for blog posts:", error)
    return []
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BlogPostClient slug={slug} />
    </Suspense>
  )
}
