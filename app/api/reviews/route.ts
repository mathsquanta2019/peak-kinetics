import { type NextRequest, NextResponse } from "next/server"
import { mockReviews } from "@/lib/mock-data/reviews"

// In-memory storage (in production, this would be a database)
const reviews = [...mockReviews]

// GET - Fetch all reviews
export async function GET() {
  try {
    // Simulate database delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Return reviews sorted by date (newest first)
    const sortedReviews = [...reviews].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    return NextResponse.json({
      success: true,
      data: sortedReviews,
      count: sortedReviews.length,
    })
  } catch (error) {
    console.error("[API] Error fetching reviews:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch reviews" }, { status: 500 })
  }
}

// POST - Create a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, role, text, fullText, rating, treatment, image } = body

    // Validate required fields
    if (!name || !text || !rating) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Create new review
    const newReview = {
      id: String(reviews.length + 1),
      name,
      role: role || "Patient",
      text,
      fullText: fullText || text,
      rating,
      treatment,
      image: image || "/placeholder.svg?height=100&width=100",
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }

    // Simulate database delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Add to reviews array
    reviews.unshift(newReview)

    console.log("[API] New review created:", newReview)

    return NextResponse.json({
      success: true,
      data: newReview,
      message: "Review submitted successfully!",
    })
  } catch (error) {
    console.error("[API] Error creating review:", error)
    return NextResponse.json({ success: false, error: "Failed to create review" }, { status: 500 })
  }
}
