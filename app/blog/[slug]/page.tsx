import { Suspense } from "react"
import BlogPostClient from "./blog-post-client"

export const dynamicParams = true

export async function generateStaticParams() {
  // Return empty array - all blog posts will be rendered client-side at runtime
  // This is necessary because the Spring Boot backend is not running during build
  return []
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BlogPostClient slug={slug} />
    </Suspense>
  )
}
