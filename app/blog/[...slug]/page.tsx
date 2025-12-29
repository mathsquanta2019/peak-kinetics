import { API_ENDPOINTS } from "@/lib/api-config"

async function fetchBlogSlugs() {
  const response = await fetch(API_ENDPOINTS.blog.all)
  if (!response.ok) {
    throw new Error("Failed to fetch blog posts")
  }
  return response.json()
}

export async function generateStaticParams() {
  const posts = await fetchBlogSlugs()
  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }))
}

export default function ServerBlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  // This component will be replaced by the client component
  // and will only be responsible for generating static params.
  // The actual content rendering will be handled by the client component.
  return (
    <div>
      {/* This div will be rendered by the client component */}
      <p>Loading blog post...</p>
    </div>
  )
}
