"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Mail, MailOpen } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-config"

interface Message {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string | null
  address: string | null
  message: string
  read: boolean
  createdAt: string
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch(API_ENDPOINTS.messages.list, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("[v0] Messages API response:", result)

      // Extract messages array from nested data structure
      const messagesData = result.data || []
      setMessages(messagesData)
      setUnreadCount(result.unread || 0)
    } catch (error) {
      console.error("[v0] Error fetching messages:", error)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`API_ENDPOINTS.messages.markAsRead/${id}/read`, {
        method: "PUT",
        credentials: "include",
      })

      if (response.ok) {
        setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg)))
        setUnreadCount((prev) => Math.max(0, prev - 1))
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, read: true })
        }
      }
    } catch (error) {
      console.error("Failed to mark message as read:", error)
    }
  }

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
        `${message.firstName} ${message.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filter === "all" || (filter === "unread" && !message.read)

    return matchesSearch && matchesFilter
  })

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message)
    if (!message.read) {
      markAsRead(message.id)
    }
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
        </div>
    )
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
            <p className="text-sm text-gray-600 mt-1">{unreadCount} unread messages</p>
          </div>
          <Button onClick={fetchMessages} variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <Card className="lg:col-span-1 p-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                />
              </div>

              <div className="flex gap-2">
                <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                    className="flex-1"
                >
                  All
                </Button>
                <Button
                    variant={filter === "unread" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("unread")}
                    className="flex-1"
                >
                  Unread
                </Button>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredMessages.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No messages found</p>
                ) : (
                    filteredMessages.map((message) => (
                        <div
                            key={message.id}
                            onClick={() => handleSelectMessage(message)}
                            className={`p-4 rounded-lg cursor-pointer transition-colors ${
                                selectedMessage?.id === message.id
                                    ? "bg-sky-50 border-2 border-sky-200"
                                    : message.read
                                        ? "bg-gray-50 hover:bg-gray-100"
                                        : "bg-white border-2 border-sky-100 hover:border-sky-200"
                            }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {message.read ? (
                                  <MailOpen className="h-4 w-4 text-gray-400" />
                              ) : (
                                  <Mail className="h-4 w-4 text-sky-600" />
                              )}
                              <p className="font-semibold text-sm">
                                {message.firstName} {message.lastName}
                              </p>
                            </div>
                            {!message.read && <Badge className="bg-sky-600">New</Badge>}
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{message.email}</p>
                          <p className="text-sm text-gray-700 line-clamp-2">{message.message}</p>
                          <p className="text-xs text-gray-500 mt-2">{new Date(message.createdAt).toLocaleDateString()}</p>
                        </div>
                    ))
                )}
              </div>
            </div>
          </Card>

          {/* Message Details */}
          <Card className="lg:col-span-2 p-6">
            {selectedMessage ? (
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-sky-100 text-sky-600 p-3 rounded-full">
                        <Mail className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {selectedMessage.firstName} {selectedMessage.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{selectedMessage.email}</p>
                      </div>
                    </div>
                    {selectedMessage.read ? (
                        <Badge variant="secondary">Read</Badge>
                    ) : (
                        <Badge className="bg-sky-600">Unread</Badge>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {selectedMessage.phone && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Phone</p>
                            <p className="text-sm text-gray-900">{selectedMessage.phone}</p>
                          </div>
                      )}
                      {selectedMessage.address && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Address</p>
                            <p className="text-sm text-gray-900">{selectedMessage.address}</p>
                          </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-500">Received</p>
                        <p className="text-sm text-gray-900">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Message</p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <Mail className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No message selected</h3>
                  <p className="text-gray-600">Select a message from the list to view its details</p>
                </div>
            )}
          </Card>
        </div>
      </div>
  )
}
