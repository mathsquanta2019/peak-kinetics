import { BlogPostClientPage } from "./page.client"

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

export async function generateStaticParams() {
  // In a real application, you would fetch slugs from your CMS or database here
  // For demonstration, returning an empty array or a few dummy slugs would work.
  // Example:
  // const response = await fetch('YOUR_API_ENDPOINT/posts');
  // const posts: BlogPost[] = await response.json();
  // return posts.map(post => ({ slug: [post.slug] }));

  return []
}

export default async function BlogPostServerPage({ params }: { params: { slug: string[] } }) {
  const slug = params.slug[0]
  const API_ENDPOINTS = {
    blog: {
      slug: `${process.env.NEXT_PUBLIC_API_URL}/api/blog`, // Example API endpoint
    },
  }

  let post: BlogPost | null = null
  try {
    const response = await fetch(`${API_ENDPOINTS.blog.slug}/${slug}`)
    if (response.ok) {
      post = await response.json()
    }
  } catch (error) {
    console.error("Error fetching blog post for static generation:", error)
  }

  // Pass the fetched post data to the client component
  return <BlogPostClientPage initialPostData={post} initialSlug={slug} />
}
