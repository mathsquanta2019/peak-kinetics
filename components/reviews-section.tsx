"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ReviewModal } from "./review-modal"
import { ReviewDetailModal } from "./review-detail-modal"
import { API_ENDPOINTS } from "@/lib/api-config"

export interface Review {
  id: string
  name: string
  role: string
  image: string
  rating: number
  text: string
  date: string
  fullText?: string
  treatment?: string
}

const mockReviews: Review[] = [
  {
    id: "1",
    name: "Michael Rodriguez",
    role: "Construction Worker",
    image: "/middle-aged-construction-worker-headshot.jpg",
    rating: 5,
    text: "After my back injury, I thought I'd never work again. The team at PeakKinetics not only got me back to work but stronger than before.",
    date: "2 weeks ago",
    fullText:
      "After my back injury, I thought I'd never work again. The team at PeakKinetics not only got me back to work but stronger than before. Their approach is truly life-changing. They took time to understand my condition and created a personalized program that actually works.",
    treatment: "Back Injury Recovery",
  },
  {
    id: "2",
    name: "Jennifer Chen",
    role: "Professional Athlete",
    image: "/young-female-athlete-headshot.jpg",
    rating: 5,
    text: "As a professional tennis player, I need the best care possible. PeakKinetics delivered beyond my expectations.",
    date: "1 month ago",
    fullText:
      "As a professional tennis player, I need the best care possible. PeakKinetics delivered beyond my expectations. My shoulder feels better than it has in years. The sports-specific rehab program they provided was exactly what I needed.",
    treatment: "Shoulder Injury - Sports Performance",
  },
  {
    id: "3",
    name: "Robert Thompson",
    role: "Retired Teacher",
    image: "/elderly-man-smiling-headshot.jpg",
    rating: 5,
    text: "At 68, I was struggling with balance and mobility. The geriatric program here has given me my confidence back.",
    date: "3 weeks ago",
    fullText:
      "At 68, I was struggling with balance and mobility. The geriatric program here has given me my confidence back. I'm walking without fear again. The therapists were incredibly patient and understanding of my needs.",
    treatment: "Balance & Mobility Program",
  },
  {
    id: "4",
    name: "Amanda Foster",
    role: "Working Mom",
    image: "/young-mother-headshot.jpg",
    rating: 5,
    text: "Between work and kids, I developed chronic neck pain. The flexible scheduling at PeakKinetics fit perfectly into my busy life.",
    date: "1 week ago",
    fullText:
      "Between work and kids, I developed chronic neck pain. The flexible scheduling and effective treatment at PeakKinetics fit perfectly into my busy life. They understood my constraints and helped me manage my pain effectively.",
    treatment: "Chronic Neck Pain Management",
  },
  {
    id: "5",
    name: "David Kim",
    role: "Weekend Warrior",
    image: "/middle-aged-man-athlete-headshot.jpg",
    rating: 5,
    text: "My knee injury from basketball was limiting everything I loved. The sports rehab program got me back on the court.",
    date: "5 days ago",
    fullText:
      "My knee injury from basketball was limiting everything I loved. The sports rehab program got me back on the court and taught me how to prevent future injuries. The team's expertise in sports medicine is unmatched.",
    treatment: "Knee Injury - Basketball Recovery",
  },
  {
    id: "6",
    name: "Maria Santos",
    role: "Office Manager",
    image: "/professional-woman-headshot.png",
    rating: 5,
    text: "Years of desk work had destroyed my posture. The movement screening and exercises have transformed how I feel.",
    date: "10 days ago",
    fullText:
      "Years of desk work had destroyed my posture and caused constant pain. The movement screening and corrective exercises have transformed how I feel every day. I can't thank them enough for helping me reclaim my health.",
    treatment: "Postural Correction & Ergonomics",
  },
  {
    id: "7",
    name: "Lisa Wong",
    role: "Fitness Instructor",
    image: "/young-female-athlete-headshot.jpg",
    rating: 5,
    text: "I was skeptical about physical therapy until I found PeakKinetics. Their scientific approach is incredible.",
    date: "3 days ago",
    fullText:
      "I was skeptical about physical therapy until I found PeakKinetics. Their scientific approach is incredible and the results speak for themselves. I've already recommended them to all my clients.",
    treatment: "Performance Enhancement",
  },
  {
    id: "8",
    name: "James Patterson",
    role: "Construction Manager",
    image: "/middle-aged-man-athlete-headshot.jpg",
    rating: 5,
    text: "Quick recovery, professional staff, and outstanding results. Couldn't ask for better.",
    date: "2 days ago",
    fullText:
      "Quick recovery, professional staff, and outstanding results. Couldn't ask for better. They got me back to managing my site in no time. Highly recommend PeakKinetics to anyone.",
    treatment: "Work-Related Injury Recovery",
  },
]

const fetchReviewsFromBackend = async (): Promise<Review[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.reviews.list)
    const result = await response.json()
    if (result.success && result.data) {
      return result.data
    }
    return mockReviews
  } catch (error) {
    console.error("[v0] Error fetching reviews:", error)
    return mockReviews
  }
}

export function ReviewsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || isPaused) return

    let animationId: number
    const scrollSpeed = 0.5 // pixels per frame

    const animate = () => {
      if (!container) return

      container.scrollLeft += scrollSpeed

      // When we reach the end, reset to beginning for infinite loop
      if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
        container.scrollLeft = 0
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isPaused, reviews])

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const newReviews = await fetchReviewsFromBackend()
        setReviews(newReviews)
      } catch (error) {
        console.error("[v0] Error fetching reviews:", error)
      }
    }, 30000) // Poll every 30 seconds

    return () => clearInterval(pollInterval)
  }, [])

  const handleAddReview = (newReview: Omit<Review, "id" | "date">) => {
    fetchReviewsFromBackend().then((freshReviews) => {
      setReviews(freshReviews)
      setIsReviewModalOpen(false)
    })
  }

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-16 gap-8 flex-col lg:flex-row">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Patient Reviews & <span className="text-primary">Success Stories</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl text-pretty">
              Scroll through thousands of real stories from patients who've transformed their lives with PeakKinetics.
            </p>
          </div>
          <Button onClick={() => setIsReviewModalOpen(true)} className="flex-shrink-0 gap-2 h-12 px-6">
            <span>+</span>
            Leave a Review
          </Button>
        </div>

        <div className="relative group">
          <div
            ref={scrollContainerRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex gap-6 overflow-x-hidden pb-4"
            style={{
              scrollBehavior: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {[...reviews, ...reviews].map((review, index) => (
              <Card
                key={`${review.id}-${index}`}
                className="flex-shrink-0 w-full sm:w-96 cursor-pointer group/card hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden"
                onClick={() => setSelectedReview(review)}
              >
                <div className="p-6 h-full flex flex-col">
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">
                        ★
                      </span>
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-muted-foreground mb-6 leading-relaxed flex-1 text-balance">"{review.text}"</p>

                  {/* Author Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={review.image || "/placeholder.svg"}
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover bg-muted"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                    <div>
                      <div className="font-semibold text-foreground">{review.name}</div>
                      <div className="text-sm text-muted-foreground">{review.role}</div>
                    </div>
                  </div>

                  {/* Date and Treatment */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                    <span>{review.date}</span>
                    {review.treatment && (
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                        {review.treatment}
                      </span>
                    )}
                  </div>

                  {/* Click hint */}
                  <div className="text-xs text-primary mt-3 group-hover/card:underline">
                    Click to read full review →
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {isPaused && (
            <div className="absolute top-4 right-4 bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-medium">
              Paused
            </div>
          )}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">{reviews.length}+</div>
            <div className="text-muted-foreground">Patient Reviews</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">4.9/5</div>
            <div className="text-muted-foreground">Average Rating</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">100%</div>
            <div className="text-muted-foreground">Recommended</div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} onSubmit={handleAddReview} />
      {selectedReview && <ReviewDetailModal review={selectedReview} onClose={() => setSelectedReview(null)} />}
    </section>
  )
}
