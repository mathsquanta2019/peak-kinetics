import BlogPostClient from "./blog-post-client"

export async function generateStaticParams() {
  // In a real application, you would fetch your blog post slugs from an API or database
  // For demonstration purposes, we'll return an empty array, meaning posts will be rendered on-demand.
  // If you had slugs, it would look something like:
  // const posts = await fetch('YOUR_API_ENDPOINT_FOR_SLUGS').then(res => res.json());
  // return posts.map((post: { slug: string }) => ({ slug: post.slug }));
  return []
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  // The params are passed as a Promise because they are resolved on the server
  // BlogPostClient will handle the promise resolution.
  return <BlogPostClient params={params} />
}
