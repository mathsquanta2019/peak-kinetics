"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Textarea } from "@/components/ui/textarea"
import { Search, Mail, MailOpen, ReplyIcon, Loader2, Trash2 } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-config"

interface MessageResponse {
  id: number
  threadId: number
  parentMessageId: number | null
  isReply: boolean
  senderType: "CUSTOMER" | "ADMIN"
  firstName: string
  lastName: string
  email: string
  phone: string | null
  address: string | null
  message: string
  read: boolean
  createdAt: string
  updatedAt: string | null
  replyCount?: number
}

interface ThreadResponse {
  threadId: number
  originalMessage: MessageResponse
  replies: MessageResponse[]
  totalMessages: number
  lastActivityAt: string
  hasUnreadMessages: boolean
}

export default function AdminMessages() {
  const [threads, setThreads] = useState<ThreadResponse[]>([])
  const [selectedThread, setSelectedThread] = useState<ThreadResponse | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [sendingReply, setSendingReply] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [threadToDelete, setThreadToDelete] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

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

      const threadsData = result.data || []
      setThreads(threadsData)
      setUnreadCount(result.unread || 0)
    } catch (error) {
      console.error("[v0] Error fetching messages:", error)
      setThreads([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const markAsRead = async (messageId: number) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.messages.markAsRead}/${messageId}/read`, {
        method: "PUT",
        credentials: "include",
      })

      if (response.ok) {
        setThreads((prev) =>
          prev.map((thread) => {
            if (thread.originalMessage.id === messageId) {
              return {
                ...thread,
                originalMessage: { ...thread.originalMessage, read: true },
                hasUnreadMessages: false,
              }
            }
            return thread
          }),
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
        if (selectedThread?.originalMessage.id === messageId) {
          setSelectedThread({
            ...selectedThread,
            originalMessage: { ...selectedThread.originalMessage, read: true },
            hasUnreadMessages: false,
          })
        }
      }
    } catch (error) {
      console.error("Failed to mark message as read:", error)
    }
  }

  const handleSendReply = async () => {
    if (!selectedThread || !replyText.trim()) return

    try {
      setSendingReply(true)
      const response = await fetch(API_ENDPOINTS.messages.reply(selectedThread.threadId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          message: replyText.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to send reply: ${response.statusText}`)
      }

      const updatedThread: ThreadResponse = await response.json()

      // Update threads list with new data
      setThreads((prev) => prev.map((thread) => (thread.threadId === updatedThread.threadId ? updatedThread : thread)))

      setSelectedThread(updatedThread)
      setReplyDialogOpen(false)
      setReplyText("")

      alert("Reply sent successfully!")
    } catch (error) {
      console.error("[v0] Error sending reply:", error)
      alert("Failed to send reply. Please try again.")
    } finally {
      setSendingReply(false)
    }
  }

  const handleDeleteThread = async () => {
    if (!threadToDelete) return

    try {
      setDeleting(true)
      const response = await fetch(`${API_ENDPOINTS.messages.delete}/${threadToDelete}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Failed to delete message thread: ${response.statusText}`)
      }

      setThreads((prev) => prev.filter((thread) => thread.threadId !== threadToDelete))

      if (selectedThread?.threadId === threadToDelete) {
        setSelectedThread(null)
      }

      setDeleteDialogOpen(false)
      setThreadToDelete(null)
      alert("Message thread deleted successfully!")
    } catch (error) {
      console.error("[v0] Error deleting message:", error)
      alert("Failed to delete message thread. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  const filteredThreads = threads.filter((thread) => {
    const msg = thread.originalMessage
    const matchesSearch =
      `${msg.firstName} ${msg.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filter === "all" || (filter === "unread" && thread.hasUnreadMessages)

    return matchesSearch && matchesFilter
  })

  const handleSelectThread = (thread: ThreadResponse) => {
    setSelectedThread(thread)
    if (!thread.originalMessage.read) {
      markAsRead(thread.originalMessage.id)
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
              {filteredThreads.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No messages found</p>
              ) : (
                filteredThreads.map((thread) => {
                  const msg = thread.originalMessage
                  return (
                    <div
                      key={thread.threadId}
                      onClick={() => handleSelectThread(thread)}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedThread?.threadId === thread.threadId
                          ? "bg-sky-50 border-2 border-sky-200"
                          : msg.read
                            ? "bg-gray-50 hover:bg-gray-100"
                            : "bg-white border-2 border-sky-100 hover:border-sky-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {msg.read ? (
                            <MailOpen className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Mail className="h-4 w-4 text-sky-600" />
                          )}
                          <p className="font-semibold text-sm">
                            {msg.firstName} {msg.lastName}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!msg.read && <Badge className="bg-sky-600">New</Badge>}
                          {thread.totalMessages > 1 && <Badge variant="secondary">{thread.totalMessages}</Badge>}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{msg.email}</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{msg.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(thread.lastActivityAt).toLocaleDateString()}
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-6">
          {selectedThread ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-sky-100 text-sky-600 p-3 rounded-full">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedThread.originalMessage.firstName} {selectedThread.originalMessage.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedThread.originalMessage.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Thread with {selectedThread.totalMessages} message{selectedThread.totalMessages !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedThread.originalMessage.read ? (
                    <Badge variant="secondary">Read</Badge>
                  ) : (
                    <Badge className="bg-sky-600">Unread</Badge>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setThreadToDelete(selectedThread.threadId)
                      setDeleteDialogOpen(true)
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <Button onClick={() => setReplyDialogOpen(true)} className="bg-sky-600 hover:bg-sky-700">
                    <ReplyIcon className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {selectedThread.originalMessage.phone && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900">{selectedThread.originalMessage.phone}</p>
                    </div>
                  )}
                  {selectedThread.originalMessage.address && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="text-sm text-gray-900">{selectedThread.originalMessage.address}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-500">Received</p>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedThread.originalMessage.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Conversation</p>

                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-600">
                          {selectedThread.originalMessage.firstName} {selectedThread.originalMessage.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(selectedThread.originalMessage.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedThread.originalMessage.message}</p>
                    </div>

                    {selectedThread.replies.length > 0 && (
                      <div className="space-y-3">
                        {selectedThread.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className={`p-4 rounded-lg border-l-4 ${
                              reply.senderType === "ADMIN" ? "bg-sky-50 border-sky-500" : "bg-gray-50 border-gray-300"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-medium">
                                {reply.senderType === "ADMIN" ? (
                                  <span className="text-sky-700">Admin Reply</span>
                                ) : (
                                  <span className="text-gray-600">
                                    {reply.firstName} {reply.lastName}
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleString()}</p>
                            </div>
                            <p
                              className={`whitespace-pre-wrap ${
                                reply.senderType === "ADMIN" ? "text-sky-900" : "text-gray-900"
                              }`}
                            >
                              {reply.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
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

      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Reply to Message</DialogTitle>
            <DialogDescription>
              {selectedThread && (
                <>
                  Replying to {selectedThread.originalMessage.firstName} {selectedThread.originalMessage.lastName} (
                  {selectedThread.originalMessage.email})
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedThread && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-medium text-gray-500 mb-2">Original Message:</p>
                <p className="text-sm text-gray-700">{selectedThread.originalMessage.message}</p>
              </div>
            )}
            <div>
              <label htmlFor="reply" className="text-sm font-medium text-gray-700 mb-2 block">
                Your Reply
              </label>
              <Textarea
                id="reply"
                placeholder="Type your reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Your reply will be sent to {selectedThread?.originalMessage.email}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReplyDialogOpen(false)
                setReplyText("")
              }}
              disabled={sendingReply}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendReply}
              disabled={!replyText.trim() || sendingReply}
              className="bg-sky-600 hover:bg-sky-700"
            >
              {sendingReply ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <ReplyIcon className="h-4 w-4 mr-2" />
                  Send Reply
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message Thread</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this entire message thread? This action cannot be undone and will remove
              all conversation history ({selectedThread?.totalMessages || 0} messages).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button onClick={handleDeleteThread} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Thread"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
