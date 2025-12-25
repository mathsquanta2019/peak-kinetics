"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { BlogEditor } from "@/components/admin/blog-editor"
import { use } from "react"

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <AdminLayout>
      <BlogEditor postId={id} />
    </AdminLayout>
  )
}
