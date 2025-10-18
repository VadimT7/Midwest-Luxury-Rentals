'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { Button, Card } from '@valore/ui'
import { cn } from '@valore/ui'

// Mock testimonials - in production these would come from Sanity CMS
const testimonials = [
  {
    id: '1',
    authorName: 'Ahmed Al-Mansouri',
    content: 'Exceptional service from start to finish. The ROX 01 VIP was absolutely stunning, and the delivery to my hotel in Dubai Marina was seamless. Falcon Flair sets the standard for luxury car rentals.',
    rating: 5,
    carModel: '2025 ROX 01 VIP',
  },
  {
    id: '2',
    authorName: 'Priya Sharma',
    content: 'The BMW M440 was perfect for my Dubai business trip. The Falcon Flair team understood my needs perfectly and exceeded my expectations with their professional service.',
    rating: 5,
    carModel: 'BMW M440 Coupé',
  },
  {
    id: '3',
    authorName: 'Dmitri Volkov',
    content: "I've rented luxury cars worldwide, but Falcon Flair's attention to detail is unmatched. The RS3 Daytona was pristine, and their concierge service made everything effortless in Dubai.",
    rating: 5,
    carModel: 'Audi RS3 Daytona Grey',
  },
  {
    id: '4',
    authorName: 'Sarah Al-Khalifa',
    content: 'Driving the CLE 53 AMG through Dubai was an absolute dream. The Falcon Flair team organized the perfect experience and made sure every detail was taken care of.',
    rating: 5,
    carModel: 'Mercedes CLE 53 AMG',
  },
  {
    id: '5',
    authorName: 'James Thompson',
    content: 'Falcon Flair exceeded all my expectations. The RS3 Black was delivered in perfect condition, and their customer service team was incredibly responsive and professional throughout my rental period in Dubai.',
    rating: 5,
    carModel: 'Audi RS3 Hatchback Black',
  },
  {
    id: '6',
    authorName: 'Mohammed Hassan',
    content: 'Impeccable service from A to Z. The C43 AMG was in perfect condition and the Falcon Flair team adapted to my specific needs. I highly recommend them for an exceptional luxury rental experience in Dubai.',
    rating: 5,
    carModel: 'Mercedes C43 AMG',
  },
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }

  const current = testimonials[currentIndex]

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <p className="text-luxury text-primary mb-4">Client Experiences</p>
        <h2 className="heading-large mb-4">Voices of Excellence</h2>
        <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
          Discover why discerning individuals choose Falcon Flair for their luxury automotive experiences
        </p>
      </motion.div>

      <div className="max-w-5xl mx-auto">
        <Card className="relative overflow-hidden">
          <div className="grid md:grid-cols-5 gap-8 p-8 lg:p-12">
            {/* Car info */}
            <div className="md:col-span-2 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <h3 className="text-xl font-medium mb-1">{current.authorName}</h3>
                <p className="text-lg text-primary font-semibold mt-2">{current.carModel}</p>
              </motion.div>
              
              {/* Rating */}
              <div className="flex gap-1 justify-center md:justify-start mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-primary fill-primary" />
                ))}
              </div>
            </div>

            {/* Testimonial content */}
            <div className="md:col-span-3 flex flex-col justify-center">
              <Quote className="h-12 w-12 text-primary/20 mb-4" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-lg leading-relaxed text-neutral-700 italic">
                    "{current.content}"
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between p-6 border-t border-neutral-100">
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    'h-2 w-2 rounded-full transition-all duration-300',
                    index === currentIndex
                      ? 'bg-primary w-8'
                      : 'bg-neutral-300 hover:bg-neutral-400'
                  )}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={handlePrevious}
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={handleNext}
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
