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
import { Search, Mail, MailOpen, ReplyIcon, Loader2, Trash2, RefreshCw, X } from "lucide-react"
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
  const [unreadCount, setUnreadCount] = useState(0) // Renamed from unreadThreads to unreadCount
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [sendingReply, setSendingReply] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [threadToDelete, setThreadToDelete] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<ThreadResponse[] | null>(null)

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
        const threadData = result.data || []
        setThreads(threadData)

        // Calculate unread count from threads - count threads with unread messages
        const unreadThreadsCount = threadData.filter((thread: ThreadResponse) => thread.hasUnreadMessages).length
        setUnreadCount(unreadThreadsCount)
      }
    } catch (error) {
      console.error("[v0] Error fetching threads:", error)
      setThreads([])
    } finally {
      setLoading(false)
    }
  }

  const fetchThreadDetails = async (threadId: number) => {
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
      console.error("[v0] Error fetching thread details:", error)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchTerm(query)

    if (!query.trim()) {
      setSearchResults(null)
      setIsSearching(false)
      return
    }

    try {
      setIsSearching(true)
      const response = await fetch(API_ENDPOINTS.messages.search(query), {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        setSearchResults(result.data || [])
      }
    } catch (error) {
      console.error("Error searching messages:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    fetchThreads()
  }, [])

  const markMessageAsRead = async (messageId: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.messages.markAsRead(messageId), {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        // Refresh the selected thread to update read status
        if (selectedThread) {
          await fetchThreadDetails(selectedThread.threadId)
        }
        // Refresh threads list to update unread count
        await fetchThreads()
      }
    } catch (error) {
      console.error("Error marking message as read:", error)
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
      console.log("[v0] Reply response:", result) // Keep for debugging if needed

      // Refresh the thread to get updated data
      await fetchThreadDetails(selectedThread.threadId)

      setReplyDialogOpen(false)
      setReplyText("")
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
      fetchThreads() // Refresh unread count after deletion
    } catch (error) {
      console.error("[v0] Error deleting thread:", error)
      alert("Failed to delete thread. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  const displayThreads = searchResults !== null ? searchResults : threads

  const filteredThreads = displayThreads.filter((thread) => {
    const matchesFilter = filter === "all" || (filter === "unread" && thread.hasUnreadMessages)
    return matchesFilter
  })

  const handleThreadClick = async (thread: ThreadResponse) => {
    setSelectedThread(thread)
    await fetchThreadDetails(thread.threadId)

    // Mark unread messages in this thread as read
    const unreadMessages = thread.messages?.filter((msg) => !msg.read) || []
    for (const message of unreadMessages) {
      await markMessageAsRead(message.id)
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
          <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
            Messages
          </h2>
          <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <span className="font-semibold text-red-600">{unreadCount}</span>
              </span>
            )}
            {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={() => {
            fetchThreads()
          }}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thread List */}
        <Card className="lg:col-span-1 p-4 shadow-lg">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-8"
                />
                {searchTerm && (
                  <button
                    onClick={() => handleSearch("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {isSearching && (
                  <Loader2 className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-sky-600" />
                )}
              </div>
            </div>

            {searchTerm && (
              <div className="text-xs text-gray-600 bg-sky-50 px-3 py-2 rounded-lg">
                {isSearching
                  ? "Searching..."
                  : searchResults
                    ? `Found ${searchResults.length} result${searchResults.length !== 1 ? "s" : ""}`
                    : "No results found"}
              </div>
            )}

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
                <span className="flex items-center gap-1">
                  Unread
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white text-xs px-1.5 py-0 min-w-[20px]">{unreadCount}</Badge>
                  )}
                </span>
              </Button>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
              {filteredThreads.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    {searchTerm ? "No messages match your search" : "No messages found"}
                  </p>
                </div>
              ) : (
                filteredThreads.map((thread) => {
                  const msg = thread.originalMessage
                  const isSelected = selectedThread?.threadId === thread.threadId
                  return (
                    <div
                      key={thread.threadId}
                      onClick={() => handleThreadClick(thread)}
                      className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                        isSelected
                          ? "bg-gradient-to-br from-sky-50 to-sky-100 border-sky-500 shadow-md"
                          : thread.hasUnreadMessages
                            ? "bg-white border-sky-200 hover:border-sky-300 hover:shadow-md"
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
                          {thread.hasUnreadMessages && (
                            <Badge className="bg-red-500 text-xs px-2 animate-pulse">New</Badge>
                          )}
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
        <Card className="lg:col-span-2 p-6 shadow-lg">
          {selectedThread ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b-2 border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 text-white p-3 rounded-full shadow-lg">
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
                    <Badge className="bg-red-500 animate-pulse">Unread</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Read
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setThreadToDelete(selectedThread.threadId)
                      setDeleteDialogOpen(true)
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setReplyDialogOpen(true)}
                    size="sm"
                    className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-md"
                  >
                    <ReplyIcon className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                </div>
              </div>

              {/* Metadata */}
              {(selectedThread.originalMessage.address || selectedThread.originalMessage.createdAt) && (
                <div className="grid grid-cols-2 gap-4 pb-4 bg-gray-50 p-4 rounded-lg">
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
                <div className="space-y-4 max-h-[calc(100vh-500px)] overflow-y-auto pr-2">
                  {/* Original Message */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border-l-4 border-gray-400 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow">
                          {selectedThread.originalMessage.firstName[0]}
                          {selectedThread.originalMessage.lastName[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-700">
                            {selectedThread.originalMessage.firstName} {selectedThread.originalMessage.lastName}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            Customer
                            {!selectedThread.originalMessage.read && (
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            )}
                          </p>
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
                      className={`p-5 rounded-xl border-l-4 shadow-md hover:shadow-lg transition-shadow ${
                        reply.senderType === "ADMIN"
                          ? "bg-gradient-to-br from-sky-50 via-sky-100 to-sky-50 border-sky-500"
                          : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow ${
                              reply.senderType === "ADMIN"
                                ? "bg-gradient-to-br from-sky-500 to-sky-600"
                                : "bg-gradient-to-br from-gray-400 to-gray-500"
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
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              {reply.senderType === "ADMIN" ? "Admin" : "Customer"}
                              {!reply.read && <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
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
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
              <div className="bg-gradient-to-br from-sky-100 to-sky-200 p-8 rounded-full mb-6">
                <Mail className="h-16 w-16 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No message selected</h3>
              <p className="text-gray-600 max-w-sm">
                Select a message from the list to view the conversation thread and reply to customers
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Reply to Message</DialogTitle>
            <DialogDescription className="text-gray-600">
              Send a reply to {selectedThread?.originalMessage.firstName} {selectedThread?.originalMessage.lastName}
            </DialogDescription>
          </DialogHeader>

          {selectedThread && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Original Message</p>
                <p className="text-sm text-gray-900 line-clamp-3">{selectedThread.originalMessage.message}</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="reply-message" className="text-sm font-semibold text-gray-700">
                  Your Reply
                </label>
                <Textarea
                  id="reply-message"
                  placeholder="Type your reply here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)} disabled={sendingReply}>
              Cancel
            </Button>
            <Button
              onClick={handleSendReply}
              disabled={!replyText.trim() || sendingReply}
              className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700"
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">Delete Thread</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete this entire conversation thread? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button onClick={handleDeleteThread} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
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
