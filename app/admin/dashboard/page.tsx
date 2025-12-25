"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { Card } from "@/components/ui/card"
import { MessageSquare, Star, FileText, TrendingUp } from "lucide-react"

export default function AdminDashboard() {
  const stats = [
    {
      label: "Total Messages",
      value: "24",
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Reviews",
      value: "156",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Blog Posts",
      value: "12",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Growth",
      value: "+23%",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
          <p className="text-gray-600">Here's an overview of your practice</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/reviews"
              className="p-4 border border-gray-200 rounded-lg hover:border-sky-300 hover:bg-sky-50 transition-colors"
            >
              <Star className="h-6 w-6 text-sky-600 mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">Send Review Request</h4>
              <p className="text-sm text-gray-600">Request feedback from clients</p>
            </a>
            <a
              href="/admin/messages"
              className="p-4 border border-gray-200 rounded-lg hover:border-sky-300 hover:bg-sky-50 transition-colors"
            >
              <MessageSquare className="h-6 w-6 text-sky-600 mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">View Messages</h4>
              <p className="text-sm text-gray-600">Check client inquiries</p>
            </a>
            <a
              href="/admin/blog"
              className="p-4 border border-gray-200 rounded-lg hover:border-sky-300 hover:bg-sky-50 transition-colors"
            >
              <FileText className="h-6 w-6 text-sky-600 mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">Create Blog Post</h4>
              <p className="text-sm text-gray-600">Share knowledge with clients</p>
            </a>
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
