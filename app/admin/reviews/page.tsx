"use client"

import type React from "react"
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
import { mockDB } from "@/lib/mock-data/mock-db"
import { Upload, Send, FileText, Mail, ArrowUpDown } from "lucide-react"
import { useState, useEffect } from "react"
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

interface Review {
  id: string
  name: string
  rating: number
  text: string
  date: string
  treatment?: string
}

export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState<"view" | "send" | "import">("view")
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

  // CSV import state
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [importLoading, setImportLoading] = useState(false)

  useEffect(() => {
    const loadedReviews = mockDB.reviews.getAll()
    setReviews(loadedReviews)
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
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
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
            <ArrowUpDown className="ml-2 h-4 w-4" />
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
            <ArrowUpDown className="ml-2 h-4 w-4" />
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
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "treatment",
      header: "Treatment",
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
      if (process.env.NEXT_PUBLIC_DEV_MODE !== "false") {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        showNotification("success", `Review request sent to ${clientName} successfully!`)
        setClientName("")
        setClientEmail("")
        setClientPhone("")
        setDialogOpen(false)
      } else {
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
          setDialogOpen(false)
        } else {
          showNotification("error", "Failed to send review request")
        }
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
      const text = await csvFile.text()
      const lines = text.split("\n")
      const headers = lines[0].split(",").map((h) => h.trim())

      let importedCount = 0
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",")
        if (values.length < headers.length) continue

        const firstName = values[headers.indexOf("Patient First Name")]?.trim()
        const lastName = values[headers.indexOf("Patient Last Name")]?.trim()
        const comments = values[headers.indexOf("Comments")]?.trim()
        const completionDate = values[headers.indexOf("Survey Completion Date")]?.trim()
        const clinicNPS = values[headers.indexOf("Clinic NPS")]?.trim()

        if (firstName && lastName && comments) {
          mockDB.reviews.create({
            name: `${firstName} ${lastName}`,
            rating: clinicNPS ? Math.min(5, Math.max(1, Math.ceil(Number.parseInt(clinicNPS) / 2))) : 5,
            text: comments,
            fullText: comments,
            date: completionDate || new Date().toLocaleDateString(),
            treatment: "Physical Therapy",
            role: "Patient",
            image: "/happy-patient-headshot.jpg",
          })
          importedCount++
        }
      }

      setReviews(mockDB.reviews.getAll())
      showNotification("success", `Successfully imported ${importedCount} reviews`)
      setCsvFile(null)
      const fileInput = document.getElementById("csv-file") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (error) {
      showNotification("error", "An error occurred during import. Please check CSV format.")
    } finally {
      setImportLoading(false)
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
            <Send className="h-4 w-4 mr-2" />
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
                Import CSV
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

              <div className="flex items-center justify-between px-6 py-4 border-t">
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
                  <h4 className="font-semibold text-blue-900 mb-2">Healthcare CSV Format</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    Your CSV file should contain the following headers (system will extract Name, Comments, and Date):
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
                <Mail className="h-4 w-4 mr-2" />
                {sendLoading ? "Sending..." : "Send Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
