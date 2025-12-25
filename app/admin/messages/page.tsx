"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { API_ENDPOINTS } from "@/lib/api-config"
import { adminAuth } from "@/lib/admin-auth"
import { useState, useEffect } from "react"
import { Search, Mail, MailOpen, Trash2, Calendar, User, Phone, MapPin } from "lucide-react"

interface Message {
  id: string
  firstName?: string
  lastName?: string
  email: string
  phone?: string
  address?: string
  message: string
  createdAt: string
  read: boolean
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<"all" | "read" | "unread">("all")

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const token = adminAuth.getToken()
      const response = await fetch(API_ENDPOINTS.messages.list, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      const token = adminAuth.getToken()
      await fetch(`${API_ENDPOINTS.messages.list}/${messageId}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setMessages(messages.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg)))
    } catch (error) {
      console.error("Failed to mark message as read:", error)
    }
  }

  const deleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return

    try {
      const token = adminAuth.getToken()
      await fetch(`${API_ENDPOINTS.messages.list}/${messageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setMessages(messages.filter((msg) => msg.id !== messageId))
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null)
      }
    } catch (error) {
      console.error("Failed to delete message:", error)
    }
  }

  const filteredMessages = messages
    .filter((msg) => {
      if (filterStatus === "read") return msg.read
      if (filterStatus === "unread") return !msg.read
      return true
    })
    .filter(
      (msg) =>
        msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${msg.firstName} ${msg.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()),
    )

  const unreadCount = messages.filter((msg) => !msg.read).length

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Messages</h2>
            <p className="text-gray-600">
              {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={fetchMessages} variant="outline">
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4">
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filter */}
                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("all")}
                    className={filterStatus === "all" ? "bg-sky-600 hover:bg-sky-700" : ""}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterStatus === "unread" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("unread")}
                    className={filterStatus === "unread" ? "bg-sky-600 hover:bg-sky-700" : ""}
                  >
                    Unread
                  </Button>
                  <Button
                    variant={filterStatus === "read" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("read")}
                    className={filterStatus === "read" ? "bg-sky-600 hover:bg-sky-700" : ""}
                  >
                    Read
                  </Button>
                </div>
              </div>
            </Card>

            {/* Messages List */}
            <div className="space-y-2">
              {loading ? (
                <Card className="p-6 text-center text-gray-500">Loading messages...</Card>
              ) : filteredMessages.length === 0 ? (
                <Card className="p-6 text-center text-gray-500">No messages found</Card>
              ) : (
                filteredMessages.map((msg) => (
                  <Card
                    key={msg.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedMessage?.id === msg.id ? "border-sky-500 bg-sky-50" : "hover:bg-gray-50"
                    } ${!msg.read ? "border-l-4 border-l-sky-600" : ""}`}
                    onClick={() => {
                      setSelectedMessage(msg)
                      if (!msg.read) markAsRead(msg.id)
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {msg.read ? (
                          <MailOpen className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Mail className="h-4 w-4 text-sky-600" />
                        )}
                        <span className="font-medium text-gray-900">
                          {msg.firstName && msg.lastName ? `${msg.firstName} ${msg.lastName}` : msg.email}
                        </span>
                      </div>
                      {!msg.read && <Badge className="bg-sky-600">New</Badge>}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{msg.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(msg.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card className="p-6">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between pb-6 border-b border-gray-200">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {selectedMessage.firstName && selectedMessage.lastName
                          ? `${selectedMessage.firstName} ${selectedMessage.lastName}`
                          : "Anonymous"}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(selectedMessage.createdAt).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        {selectedMessage.read ? (
                          <Badge variant="outline" className="text-gray-600">
                            Read
                          </Badge>
                        ) : (
                          <Badge className="bg-sky-600">Unread</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMessage(selectedMessage.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-gray-200">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <a href={`mailto:${selectedMessage.email}`} className="text-sm text-sky-600 hover:underline">
                          {selectedMessage.email}
                        </a>
                      </div>
                    </div>
                    {selectedMessage.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Phone</p>
                          <a href={`tel:${selectedMessage.phone}`} className="text-sm text-sky-600 hover:underline">
                            {selectedMessage.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedMessage.address && (
                      <div className="flex items-start gap-3 md:col-span-2">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Address</p>
                          <p className="text-sm text-gray-700">{selectedMessage.address}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Message</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      className="bg-sky-600 hover:bg-sky-700"
                      onClick={() => window.open(`mailto:${selectedMessage.email}`)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Reply via Email
                    </Button>
                    {selectedMessage.phone && (
                      <Button variant="outline" onClick={() => window.open(`tel:${selectedMessage.phone}`)}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No message selected</h3>
                <p className="text-gray-600">Select a message from the list to view its details</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
