"use client"

import type React from "react"
import * as XLSX from "xlsx"

import { useEffect } from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { API_ENDPOINTS } from "@/lib/api-config"
import { adminAuth } from "@/lib/admin-auth"
import { Upload, Search, ChevronDown, Eye, Trash2, FileText } from "lucide-react"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
} from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface Review {
  id: string
  name: string
  rating: number
  text: string
  date: string
  treatment?: string
}

export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState<"view" | "import">("view")
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const [dialogOpen, setDialogOpen] = useState(false)
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [message, setMessage] = useState(
    "Thank you for choosing Peak Kinetics! We'd love to hear about your experience. Please take a moment to leave us a review.",
  )
  const [sendLoading, setSendLoading] = useState(false)

  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [importLoading, setImportLoading] = useState(false)

  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  const fetchReviews = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.reviews.list)
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const columns: ColumnDef<Review>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="border-2 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="border-2 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-100 -ml-4"
          >
            Patient Name
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "rating",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-100 -ml-4"
          >
            Rating
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < row.getValue("rating") ? "text-yellow-500" : "text-gray-300"}>
              ★
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "text",
      header: "Comment",
      cell: ({ row }) => <div className="max-w-md truncate">{row.getValue("text")}</div>,
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-100 -ml-4"
          >
            Date
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "treatment",
      header: "Treatment",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const review = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedReview(review)
                  setViewDialogOpen(true)
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDeleteReview(review.id)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Review
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: reviews,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
  })

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
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
        }),
      })

      if (response.ok) {
        showNotification("success", `Review request sent to ${clientName} successfully!`)
        setClientName("")
        setClientEmail("")
        setClientPhone("")
        setDialogOpen(false)
      } else {
        showNotification("error", "Failed to send review request")
      }
    } catch (error) {
      showNotification("error", "An error occurred while sending the request")
    } finally {
      setSendLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadFile(file)
    setImportLoading(true)

    try {
      // Parse file based on type
      const reviews = await parseFile(file)

      if (reviews.length === 0) {
        showNotification("error", "No valid reviews found in file")
        setImportLoading(false)
        return
      }

      // Send parsed reviews to API
      const token = adminAuth.getToken()
      const response = await fetch(API_ENDPOINTS.reviews.import, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reviews }),
      })

      if (response.ok) {
        const result = await response.json()
        fetchReviews()
        showNotification("success", `Successfully imported ${result.count} reviews`)
        setUploadFile(null)
      } else {
        showNotification("error", "Failed to import reviews")
      }
    } catch (error) {
      console.error("[v0] Error importing file:", error)
      showNotification("error", "An error occurred during import")
    } finally {
      setImportLoading(false)
    }
  }

  const parseFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = e.target?.result
          let workbook: XLSX.WorkBook

          if (file.name.endsWith(".csv")) {
            // Parse CSV
            workbook = XLSX.read(data, { type: "binary" })
          } else {
            // Parse XLSX/XLS
            workbook = XLSX.read(data, { type: "array" })
          }

          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

          // Find header row and extract data
          const headers = jsonData[0] as string[]
          const rows = jsonData.slice(1) as any[][]

          // Map column names to indices
          const firstNameIdx = headers.findIndex((h) => h?.toLowerCase().includes("first name"))
          const lastNameIdx = headers.findIndex((h) => h?.toLowerCase().includes("last name"))
          const commentsIdx = headers.findIndex((h) => h?.toLowerCase().includes("comments"))
          const npsIdx = headers.findIndex(
            (h) => h?.toLowerCase().includes("clinic nps") || h?.toLowerCase().includes("provider nps"),
          )
          const completionDateIdx = headers.findIndex(
            (h) => h?.toLowerCase().includes("completion date") || h?.toLowerCase().includes("survey completion"),
          )

          // Extract reviews
          const reviews = rows
            .filter((row) => row[commentsIdx] && row[commentsIdx].trim())
            .map((row) => {
              const firstName = row[firstNameIdx] || ""
              const lastName = row[lastNameIdx] || ""
              const name = `${firstName} ${lastName}`.trim() || "Anonymous"
              const text = row[commentsIdx] || ""
              const npsScore = Number.parseInt(row[npsIdx]) || 0
              const rating = Math.min(5, Math.max(1, Math.ceil(npsScore / 2)))
              const date = row[completionDateIdx] || new Date().toISOString().split("T")[0]

              return { name, rating, text, date }
            })

          resolve(reviews)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(reader.error)

      if (file.name.endsWith(".csv")) {
        reader.readAsBinaryString(file)
      } else {
        reader.readAsArrayBuffer(file)
      }
    })
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return

    try {
      const token = adminAuth.getToken()
      const response = await fetch(`${API_ENDPOINTS.reviews.list}/${reviewId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (response.ok) {
        fetchReviews()
        setNotification({ type: "success", message: "Review deleted successfully" })
      } else {
        throw new Error("Failed to delete review")
      }
    } catch (error) {
      setNotification({ type: "error", message: "Failed to delete review" })
    } finally {
      setTimeout(() => setNotification(null), 3000)
      setViewDialogOpen(false)
    }
  }

  return (
    <>
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

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Management</h2>
            <p className="text-gray-600">Manage reviews and send requests to clients</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="bg-sky-600 hover:bg-sky-700">
            <Search className="h-4 w-4 mr-2" />
            Send Review Request
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("view")}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "view"
                  ? "border-sky-600 text-sky-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              View Reviews
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
                Import CSV/XLSX
              </div>
            </button>
          </div>
        </div>

        {activeTab === "view" && (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between gap-4">
                <Input
                  placeholder="Search reviews by name, comment..."
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="max-w-sm"
                />
                {Object.keys(rowSelection).length > 0 && (
                  <div className="text-sm text-gray-600">{Object.keys(rowSelection).length} row(s) selected</div>
                )}
              </div>
            </Card>

            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-6 py-4 text-sm text-gray-900">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                          No reviews found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                <div className="text-sm text-gray-700">
                  Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length,
                  )}{" "}
                  of {table.getFilteredRowModel().rows.length} reviews
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Import CSV Tab */}
        {activeTab === "import" && (
          <div className="space-y-6">
            <Card className="p-6">
              <form className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV or XLSX File</h3>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-sky-400 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <Label
                        htmlFor="file-upload"
                        className="text-sm text-gray-600 mb-2 block cursor-pointer hover:text-sky-600"
                      >
                        {uploadFile ? uploadFile.name : "Click to select a CSV or XLSX file or drag and drop"}
                      </Label>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500 mt-2">CSV or XLSX files only</p>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  disabled={importLoading}
                  className="bg-sky-600 hover:bg-sky-700"
                >
                  {importLoading ? "Importing..." : uploadFile ? "Upload Another File" : "Select File to Import"}
                </Button>
              </form>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex gap-4">
                <FileText className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Healthcare CSV/XLSX Format</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    Your file should contain the following headers (system will extract Name, Comments, and Date):
                  </p>
                  <div className="text-xs text-blue-800 space-y-1 font-mono bg-white/50 p-3 rounded">
                    <p>Patient Account Number, Patient First Name, Patient Last Name, Case Title,</p>
                    <p>Case Facility, Case Therapist, Case Status, Survey Sent Date, Response,</p>
                    <p>Clinic NPS, Provider NPS, Likelihood to Receive Specialist Care,</p>
                    <p>Discharge Date, Survey Completion Date, Is Invalid, Comments</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Review Request</DialogTitle>
            <DialogDescription>Enter client details to send a review request via email or SMS.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendRequest}>
            <div className="space-y-4 py-4">
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
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Phone Number (Optional)</Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={sendLoading} className="bg-sky-600 hover:bg-sky-700">
                {sendLoading ? "Sending..." : "Send Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>Full review information</DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Patient Name</Label>
                <p className="mt-1 text-gray-900">{selectedReview.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Rating</Label>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={i < selectedReview.rating ? "text-yellow-500 text-xl" : "text-gray-300 text-xl"}
                    >
                      ★
                    </span>
                  ))}
                  <span className="ml-2 text-gray-600">({selectedReview.rating}/5)</span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Treatment</Label>
                <p className="mt-1 text-gray-900">{selectedReview.treatment}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Date</Label>
                <p className="mt-1 text-gray-900">{selectedReview.date}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Comment</Label>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{selectedReview.text}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
