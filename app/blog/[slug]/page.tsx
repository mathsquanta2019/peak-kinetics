import { Suspense } from "react"
import BlogPostClient from "./blog-post-client"

export async function generateStaticParams() {
  // For static export, we need to return at least one param
  // In development, return empty to allow dynamic rendering
  // In production build, you can fetch from your mock data or return a default
  if (process.env.NODE_ENV === "development") {
    return []
  }

  // Return a default blog post slug for static generation
  // The actual posts will be fetched from Spring Boot API at runtime
  return [{ slug: "welcome-to-peak-kinetics" }]
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BlogPostClient slug={params.slug} />
    </Suspense>
  )
}
