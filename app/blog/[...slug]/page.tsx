import BlogPostClient from "./blog-post-client"

export async function generateStaticParams() {
  // In a real application, you would fetch all blog post slugs here
  // For demonstration purposes, we'll return an empty array
  return []
}

export const dynamicParams = true

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  // The `slug` parameter in Next.js catch-all routes is an array.
  // For a single slug, we expect it to be the first element.
  // If it's an array with multiple elements, you might need to join them or handle differently.
  const slug = Array.isArray(params.slug) ? params.slug.join("/") : params.slug
  return <BlogPostClient slug={slug} />
}
