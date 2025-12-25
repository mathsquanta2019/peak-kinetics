import { type NextRequest, NextResponse } from "next/server"
import { mockMessages, type ContactMessage } from "@/lib/mock-data/messages"

// In-memory storage (in production, this would be a database)
const messages = [...mockMessages]

// GET - Fetch all messages (admin use)
export async function GET() {
  try {
    // Simulate database delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Return messages sorted by date (newest first)
    const sortedMessages = [...messages].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return NextResponse.json({
      success: true,
      data: sortedMessages,
      count: sortedMessages.length,
    })
  } catch (error) {
    console.error("[API] Error fetching messages:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch messages" }, { status: 500 })
  }
}

// POST - Create a new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, address, message } = body

    if (!email || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and message are required fields",
        },
        { status: 400 },
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    if (phone && phone.trim()) {
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
      const cleanPhone = phone.replace(/[\s\-()]/g, "")
      if (!phoneRegex.test(cleanPhone)) {
        return NextResponse.json({ success: false, error: "Invalid phone number format" }, { status: 400 })
      }
    }

    // Create new message with optional fields
    const newMessage: ContactMessage = {
      id: String(messages.length + 1),
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      email,
      phone: phone || undefined,
      address: address || undefined,
      message,
      createdAt: new Date().toISOString(),
      status: "new",
    }

    // Simulate database delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Add to messages array
    messages.unshift(newMessage)

    console.log("[API] New message received:", newMessage)

    return NextResponse.json({
      success: true,
      data: newMessage,
      message: "Message sent successfully! We'll get back to you within 2 hours.",
    })
  } catch (error) {
    console.error("[API] Error creating message:", error)
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 })
  }
}
