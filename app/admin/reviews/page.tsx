"use client"

import type React from "react"

import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { API_ENDPOINTS } from "@/lib/api-config"
import { adminAuth } from "@/lib/admin-auth"
import { Upload, Send, FileText } from "lucide-react"
import { useState } from "react"

export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState<"send" | "import">("send")
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Send review request state
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [message, setMessage] = useState(
    "Thank you for choosing Peak Kinetics! We'd love to hear about your experience. Please take a moment to leave us a review.",
  )
  const [sendLoading, setSendLoading] = useState(false)

  // CSV import state
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [importLoading, setImportLoading] = useState(false)

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendLoading(true)

    try {
      const token = adminAuth.getToken()
      const response = await fetch(API_ENDPOINTS.reviews.sendRequest, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientName,
          email: clientEmail,
          phone: clientPhone,
          message,
        }),
      })

      if (response.ok) {
        showNotification("success", "Review request sent successfully!")
        setClientName("")
        setClientEmail("")
        setClientPhone("")
      } else {
        showNotification("error", "Failed to send review request")
      }
    } catch (error) {
      showNotification("error", "An error occurred while sending the request")
    } finally {
      setSendLoading(false)
    }
  }

  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!csvFile) {
      showNotification("error", "Please select a CSV file")
      return
    }

    setImportLoading(true)

    try {
      const token = adminAuth.getToken()
      const formData = new FormData()
      formData.append("file", csvFile)

      const response = await fetch(API_ENDPOINTS.reviews.import, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        showNotification("success", `Successfully imported ${data.count || 0} reviews`)
        setCsvFile(null)
        const fileInput = document.getElementById("csv-file") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      } else {
        showNotification("error", "Failed to import reviews")
      }
    } catch (error) {
      showNotification("error", "An error occurred during import")
    } finally {
      setImportLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Notification */}
        {notification && (
          <div
            className={`fixed bottom-6 right-6 z-50 rounded-lg border-2 px-6 py-4 shadow-lg ${
              notification.type === "success"
                ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                : "border-red-500 bg-red-50 text-red-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`h-2 w-2 rounded-full ${notification.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}
              />
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Management</h2>
          <p className="text-gray-600">Send review requests or import reviews from CSV</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("send")}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "send"
                  ? "border-sky-600 text-sky-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Send Review Request
              </div>
            </button>
            <button
              onClick={() => setActiveTab("import")}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "import"
                  ? "border-sky-600 text-sky-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import from CSV
              </div>
            </button>
          </div>
        </div>

        {/* Send Review Request Tab */}
        {activeTab === "send" && (
          <Card className="p-6">
            <form onSubmit={handleSendRequest} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Email Address *</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="clientPhone">Phone Number (Optional)</Label>
                    <Input
                      id="clientPhone"
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Button type="submit" disabled={sendLoading} className="bg-sky-600 hover:bg-sky-700">
                <Send className="h-4 w-4 mr-2" />
                {sendLoading ? "Sending..." : "Send Review Request"}
              </Button>
            </form>
          </Card>
        )}

        {/* Import CSV Tab */}
        {activeTab === "import" && (
          <div className="space-y-6">
            <Card className="p-6">
              <form onSubmit={handleImportCSV} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h3>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-sky-400 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <Label
                        htmlFor="csv-file"
                        className="text-sm text-gray-600 mb-2 block cursor-pointer hover:text-sky-600"
                      >
                        {csvFile ? csvFile.name : "Click to select a CSV file or drag and drop"}
                      </Label>
                      <Input
                        id="csv-file"
                        type="file"
                        accept=".csv"
                        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500 mt-2">CSV files only</p>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={importLoading || !csvFile} className="bg-sky-600 hover:bg-sky-700">
                  <Upload className="h-4 w-4 mr-2" />
                  {importLoading ? "Importing..." : "Import Reviews"}
                </Button>
              </form>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex gap-4">
                <FileText className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">CSV Format Requirements</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    Your CSV file should contain the following columns (in this order):
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>
                      <strong>name</strong> - Client's full name
                    </li>
                    <li>
                      <strong>rating</strong> - Rating from 1 to 5
                    </li>
                    <li>
                      <strong>comment</strong> - Review text
                    </li>
                    <li>
                      <strong>service</strong> - Service name (optional)
                    </li>
                    <li>
                      <strong>date</strong> - Review date in YYYY-MM-DD format (optional)
                    </li>
                  </ul>
                  <p className="text-xs text-blue-700 mt-3">
                    Example: John Doe,5,"Great service and excellent care!",Sports Rehabilitation,2024-01-15
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
