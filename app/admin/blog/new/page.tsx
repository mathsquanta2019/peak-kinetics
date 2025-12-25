"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { BlogEditor } from "@/components/admin/blog-editor"

export default function NewBlogPostPage() {
  return (
    <AdminLayout>
      <BlogEditor />
    </AdminLayout>
  )
}
