"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { API_ENDPOINTS } from "@/lib/api-config"
import { useState, useEffect } from "react"
import { Search, Calendar, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  featuredImage?: string
  author: string
  publishedAt: string
  tags: string[]
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.blog.list}?status=published&limit=100`)
      if (response.ok) {
        const result = await response.json()
        console.log("[v0] Blog API response:", result)
        const postsArray = result.data || []
        setPosts(postsArray)
      } else {
        console.error("[v0] Failed to fetch blog posts. Status:", response.status)
      }
    } catch (error) {
      console.error("[v0] Error fetching blog posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-gray-50 pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-block mb-4">
              <Badge className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-1.5 text-sm font-medium">
                Knowledge Hub
              </Badge>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-6 leading-tight">
              Physical Therapy Insights
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Expert guidance on rehabilitation, injury prevention, and optimal movement for peak performance
            </p>
          </div>

          {!loading && posts.length > 0 && (
            <div className="max-w-2xl mx-auto mb-16">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Search articles, topics, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-14 pr-6 h-14 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                    />
                  </div>
                </div>
              </div>
              {searchQuery && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  Found {filteredPosts.length} article{filteredPosts.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}

          {/* Blog Posts Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sky-200 border-t-sky-600 mb-4" />
              <p className="text-gray-500 text-lg">Loading articles...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-10 w-10 text-sky-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Coming Soon</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                We're preparing expert content on physical therapy, rehabilitation, and wellness. Check back soon for
                our latest insights!
              </p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Results Found</h3>
              <p className="text-gray-600 text-lg">Try adjusting your search terms or browse all articles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {filteredPosts.map((post, index) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card
                    className="overflow-hidden hover:shadow-2xl transition-all duration-500 h-full flex flex-col group border-gray-200 hover:border-sky-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {post.featuredImage && (
                      <div className="relative h-56 bg-gradient-to-br from-sky-50 to-blue-50 overflow-hidden">
                        <Image
                          src={post.featuredImage || "/placeholder.svg"}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h2>
                      <p className="text-gray-600 mb-6 line-clamp-3 flex-1 leading-relaxed">{post.excerpt}</p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-sky-500" />
                            {new Date(post.publishedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-sky-500" />
                            <span>5 min</span>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-sky-500 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
