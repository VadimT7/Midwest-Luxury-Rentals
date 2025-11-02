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
    authorName: 'Jennifer Martinez',
    content: 'Rented the Bentley Bentayga for my anniversary weekend and it was absolutely perfect. The car was spotless, delivery was on time, and driving it through Chicago felt incredible. My husband was so impressed - definitely booking again for our next special occasion.',
    rating: 5,
    carModel: 'Bentley Bentayga',
  },
  {
    id: '2',
    authorName: 'Rajesh Patel',
    content: "I needed something impressive for a client meeting and the Porsche 911 Turbo S did not disappoint. The horsepower on that thing is insane! Midwest Luxury Rentals made the whole process so smooth - I was in and out in minutes. They even helped me find parking near the restaurant.",
    rating: 5,
    carModel: 'Porsche 911 Turbo S - 900HP',
  },
  {
    id: '3',
    authorName: 'Aaliyah Washington',
    content: "The Lamborghini Urus was everything I dreamed it would be. Rented it for my birthday and let me tell you, turning heads down Michigan Avenue never gets old. The team was super helpful, answered all my questions, and the car was in mint condition. Worth every penny!",
    rating: 5,
    carModel: 'Lamborghini Urus',
  },
  {
    id: '4',
    authorName: 'Marcus Chen',
    content: 'Had the Ferrari SF90 Spider for a weekend and wow, just wow. I\'ve driven a lot of fast cars but this thing is on another level. The team at Midwest Luxury Rentals knows their stuff - they walked me through all the features and even recommended some great driving routes.',
    rating: 5,
    carModel: 'Ferrari SF90 Spider',
  },
  {
    id: '5',
    authorName: 'Sofia Rodriguez',
    content: "Booked the Mercedes S580 Maybach for a week and it was pure luxury. The ride was so smooth and comfortable, perfect for the longer drives we took. Customer service responded immediately when I had questions, and the pickup/dropoff was super convenient.",
    rating: 5,
    carModel: 'Mercedes-Benz S580 Maybach',
  },
  {
    id: '6',
    authorName: 'James O\'Connor',
    content: "The McLaren 720S exceeded all my expectations. Rented it for a special occasion and the performance was absolutely mind-blowing. The Midwest Luxury Rentals team was professional, the car was pristine, and the whole experience was seamless. Highly recommend!",
    rating: 5,
    carModel: 'McLaren 720S',
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
          Discover why discerning individuals choose Midwest Luxury Rentals for their luxury automotive experiences
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
