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
import { Search, Mail, MailOpen, ReplyIcon, Loader2, Trash2, RefreshCw } from "lucide-react"
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
  const [unreadThreads, setUnreadThreads] = useState(0)
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [sendingReply, setSendingReply] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [threadToDelete, setThreadToDelete] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchThreads = async () => {
    try {
      setLoading(true)
      const response = await fetch(API_ENDPOINTS.messages.threads, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch threads: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("[v0] Threads API response:", result)

      if (result.success) {
        setThreads(result.data || [])
        setUnreadThreads(result.unreadThreads || 0)
      }
    } catch (error) {
      console.error("[v0] Error fetching threads:", error)
      setThreads([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchThreads()
  }, [])

  const markThreadAsRead = async (threadId: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.messages.markThreadAsRead(threadId), {
        method: "PATCH",
        credentials: "include",
      })

      if (response.ok) {
        setThreads((prev) =>
          prev.map((thread) => {
            if (thread.threadId === threadId) {
              return {
                ...thread,
                hasUnreadMessages: false,
                originalMessage: { ...thread.originalMessage, read: true },
                replies: thread.replies.map((r) => ({ ...r, read: true })),
              }
            }
            return thread
          }),
        )
        setUnreadThreads((prev) => Math.max(0, prev - 1))

        if (selectedThread?.threadId === threadId) {
          setSelectedThread({
            ...selectedThread,
            hasUnreadMessages: false,
            originalMessage: { ...selectedThread.originalMessage, read: true },
            replies: selectedThread.replies.map((r) => ({ ...r, read: true })),
          })
        }
      }
    } catch (error) {
      console.error("[v0] Failed to mark thread as read:", error)
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

      const result = await response.json()
      console.log("[v0] Reply response:", result)

      // Refresh the thread to get updated data
      await refreshThread(selectedThread.threadId)

      setReplyDialogOpen(false)
      setReplyText("")
    } catch (error) {
      console.error("[v0] Error sending reply:", error)
      alert("Failed to send reply. Please try again.")
    } finally {
      setSendingReply(false)
    }
  }

  const refreshThread = async (threadId: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.messages.getThread(threadId), {
        credentials: "include",
      })

      if (!response.ok) return

      const result = await response.json()

      if (result.success) {
        const updatedThread = result.data
        setThreads((prev) => prev.map((t) => (t.threadId === threadId ? updatedThread : t)))

        if (selectedThread?.threadId === threadId) {
          setSelectedThread(updatedThread)
        }
      }
    } catch (error) {
      console.error("[v0] Error refreshing thread:", error)
    }
  }

  const handleDeleteThread = async () => {
    if (!threadToDelete) return

    try {
      setDeleting(true)
      const response = await fetch(API_ENDPOINTS.messages.deleteThread(threadToDelete), {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Failed to delete thread: ${response.statusText}`)
      }

      setThreads((prev) => prev.filter((thread) => thread.threadId !== threadToDelete))

      if (selectedThread?.threadId === threadToDelete) {
        setSelectedThread(null)
      }

      setDeleteDialogOpen(false)
      setThreadToDelete(null)
    } catch (error) {
      console.error("[v0] Error deleting thread:", error)
      alert("Failed to delete thread. Please try again.")
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
    if (thread.hasUnreadMessages) {
      markThreadAsRead(thread.threadId)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Messages</h2>
          <p className="text-sm text-gray-600 mt-1">
            {unreadThreads} unread thread{unreadThreads !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={fetchThreads} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thread List */}
        <Card className="lg:col-span-1 p-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className="flex-1"
              >
                All ({threads.length})
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
                className="flex-1"
              >
                Unread ({unreadThreads})
              </Button>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
              {filteredThreads.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No messages found</p>
                </div>
              ) : (
                filteredThreads.map((thread) => {
                  const msg = thread.originalMessage
                  const isSelected = selectedThread?.threadId === thread.threadId
                  return (
                    <div
                      key={thread.threadId}
                      onClick={() => handleSelectThread(thread)}
                      className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                        isSelected
                          ? "bg-sky-50 border-sky-500 shadow-sm"
                          : thread.hasUnreadMessages
                            ? "bg-white border-sky-200 hover:border-sky-300 hover:shadow-sm"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {thread.hasUnreadMessages ? (
                            <Mail className="h-4 w-4 text-sky-600 flex-shrink-0" />
                          ) : (
                            <MailOpen className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          )}
                          <p className="font-semibold text-sm truncate">
                            {msg.firstName} {msg.lastName}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                          {thread.hasUnreadMessages && <Badge className="bg-sky-600 text-xs px-2">New</Badge>}
                          {thread.totalMessages > 1 && (
                            <Badge variant="secondary" className="text-xs px-2">
                              {thread.totalMessages}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 truncate">{msg.email}</p>
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">{msg.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(thread.lastActivityAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </Card>

        {/* Thread Detail */}
        <Card className="lg:col-span-2 p-6">
          {selectedThread ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-sky-400 to-sky-600 text-white p-3 rounded-full">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedThread.originalMessage.firstName} {selectedThread.originalMessage.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedThread.originalMessage.email}</p>
                    {selectedThread.originalMessage.phone && (
                      <p className="text-sm text-gray-600">{selectedThread.originalMessage.phone}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-sky-500 rounded-full"></span>
                      {selectedThread.totalMessages} message{selectedThread.totalMessages !== 1 ? "s" : ""} in thread
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedThread.hasUnreadMessages ? (
                    <Badge className="bg-sky-600">Unread</Badge>
                  ) : (
                    <Badge variant="secondary">Read</Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setThreadToDelete(selectedThread.threadId)
                      setDeleteDialogOpen(true)
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => setReplyDialogOpen(true)} size="sm" className="bg-sky-600 hover:bg-sky-700">
                    <ReplyIcon className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                </div>
              </div>

              {/* Metadata */}
              {(selectedThread.originalMessage.address || selectedThread.originalMessage.createdAt) && (
                <div className="grid grid-cols-2 gap-4 pb-4">
                  {selectedThread.originalMessage.address && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address</p>
                      <p className="text-sm text-gray-900">{selectedThread.originalMessage.address}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">First Contact</p>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedThread.originalMessage.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Conversation Thread */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Conversation</h4>
                <div className="space-y-4">
                  {/* Original Message */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border-l-4 border-gray-400 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {selectedThread.originalMessage.firstName[0]}
                          {selectedThread.originalMessage.lastName[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-700">
                            {selectedThread.originalMessage.firstName} {selectedThread.originalMessage.lastName}
                          </p>
                          <p className="text-xs text-gray-500">Customer</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(selectedThread.originalMessage.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {selectedThread.originalMessage.message}
                    </p>
                  </div>

                  {/* Replies */}
                  {selectedThread.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`p-5 rounded-xl border-l-4 shadow-sm ${
                        reply.senderType === "ADMIN"
                          ? "bg-gradient-to-br from-sky-50 to-sky-100 border-sky-500"
                          : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${
                              reply.senderType === "ADMIN" ? "bg-sky-600" : "bg-gray-400"
                            }`}
                          >
                            {reply.senderType === "ADMIN" ? (
                              "PT"
                            ) : (
                              <>
                                {reply.firstName[0]}
                                {reply.lastName[0]}
                              </>
                            )}
                          </div>
                          <div>
                            <p
                              className={`text-xs font-semibold ${
                                reply.senderType === "ADMIN" ? "text-sky-700" : "text-gray-700"
                              }`}
                            >
                              {reply.senderType === "ADMIN"
                                ? "Peak Kinetics Team"
                                : `${reply.firstName} ${reply.lastName}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {reply.senderType === "ADMIN" ? "Admin" : "Customer"}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(reply.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <p
                        className={`whitespace-pre-wrap leading-relaxed ${
                          reply.senderType === "ADMIN" ? "text-sky-900" : "text-gray-900"
                        }`}
                      >
                        {reply.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-full mb-6">
                <Mail className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No message selected</h3>
              <p className="text-gray-600 max-w-sm">
                Select a conversation thread from the list to view messages and reply to customers
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Reply to Message</DialogTitle>
            <DialogDescription>
              {selectedThread && (
                <span className="text-sm">
                  Replying to{" "}
                  <span className="font-semibold">
                    {selectedThread.originalMessage.firstName} {selectedThread.originalMessage.lastName}
                  </span>{" "}
                  at <span className="font-semibold">{selectedThread.originalMessage.email}</span>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedThread && (
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Original Message:</p>
                <p className="text-sm text-gray-700 leading-relaxed">{selectedThread.originalMessage.message}</p>
              </div>
            )}
            <div>
              <label htmlFor="reply" className="text-sm font-semibold text-gray-700 mb-2 block">
                Your Reply
              </label>
              <Textarea
                id="reply"
                placeholder="Type your reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={10}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Your reply will be sent via email to {selectedThread?.originalMessage.email}
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
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
                  Sending Reply...
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl text-red-600">Delete Conversation Thread</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Are you sure you want to permanently delete this entire conversation thread? This action cannot be undone
              and will remove all {selectedThread?.totalMessages || 0} message
              {selectedThread?.totalMessages !== 1 ? "s" : ""} from your system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
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
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Thread
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
