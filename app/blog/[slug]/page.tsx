import { Suspense } from "react"
import BlogPostClient from "./blog-post-client"

export async function generateStaticParams() {
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
