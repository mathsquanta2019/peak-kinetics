import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Michael Rodriguez",
      role: "Construction Worker",
      image: "/middle-aged-construction-worker-headshot.jpg",
      rating: 5,
      text: "After my back injury, I thought I'd never work again. The team at PeakKinetics not only got me back to work but stronger than before. Their approach is truly life-changing.",
    },
    {
      name: "Jennifer Chen",
      role: "Professional Athlete",
      image: "/young-female-athlete-headshot.jpg",
      rating: 5,
      text: "As a professional tennis player, I need the best care possible. PeakKinetics delivered beyond my expectations. My shoulder feels better than it has in years.",
    },
    {
      name: "Robert Thompson",
      role: "Retired Teacher",
      image: "/elderly-man-smiling-headshot.jpg",
      rating: 5,
      text: "At 68, I was struggling with balance and mobility. The geriatric program here has given me my confidence back. I'm walking without fear again.",
    },
    {
      name: "Amanda Foster",
      role: "Working Mom",
      image: "/young-mother-headshot.jpg",
      rating: 5,
      text: "Between work and kids, I developed chronic neck pain. The flexible scheduling and effective treatment at PeakKinetics fit perfectly into my busy life.",
    },
    {
      name: "David Kim",
      role: "Weekend Warrior",
      image: "/middle-aged-man-athlete-headshot.jpg",
      rating: 5,
      text: "My knee injury from basketball was limiting everything I loved. The sports rehab program got me back on the court and taught me how to prevent future injuries.",
    },
    {
      name: "Maria Santos",
      role: "Office Manager",
      image: "/professional-woman-headshot.png",
      rating: 5,
      text: "Years of desk work had destroyed my posture and caused constant pain. The movement screening and corrective exercises have transformed how I feel every day.",
    },
  ]

  return (
    <section id="testimonials" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Real Stories, <span className="text-primary">Real Results</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Don't just take our word for it. Hear from the people whose lives we've helped transform through expert
            physical therapy care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={testimonial.name} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-muted-foreground mb-6 leading-relaxed text-pretty">"{testimonial.text}"</p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover bg-muted"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">4.9/5</div>
              <div className="text-sm text-muted-foreground">Google Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">1000+</div>
              <div className="text-sm text-muted-foreground">Happy Patients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">98%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">18+</div>
              <div className="text-sm text-muted-foreground">Years Experience</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
