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
    authorName: 'Mohammed Al-Rashid',
    content: 'Exceptional service from start to finish. The BMW M440 was immaculate, and the delivery to my hotel in Dubai was seamless. Falcon Flair Car Rental sets the standard for luxury car rentals in the UAE.',
    rating: 5,
  },
  {
    id: '2',
    authorName: 'Fatima Al-Mansouri',
    content: 'The Mercedes CLE 53 AMG was perfect for my photoshoot in Dubai. The team at Falcon Flair Car Rental understood exactly what I needed and went above and beyond to accommodate my schedule.',
    rating: 5,
  },
  {
    id: '3',
    authorName: 'Ahmed Al-Zaabi',
    content: "I've rented luxury cars worldwide, but Falcon Flair Car Rental's attention to detail is unmatched. The Mercedes C43 AMG was pristine, and their concierge service made everything effortless.",
    rating: 5,
  },
  {
    id: '4',
    authorName: 'Layla Hassan',
    content: "Driving the Audi RS3 through Dubai was a dream come true. Falcon Flair Car Rental's team provided excellent service and made the entire experience memorable.",
    rating: 5,
  },
  {
    id: '5',
    authorName: 'Khalid Al-Falasi',
    content: 'For my anniversary, I rented the ROX 01 VIP from Falcon Flair Car Rental. The car was stunning with its amazing range, and the premium experience made it unforgettable. Truly five-star service in Dubai.',
    rating: 5,
  },
  {
    id: '6',
    authorName: 'Omar Abdullah',
    content: "The Audi RS3 Daytona is an absolute masterpiece! Falcon Flair Car Rental delivered it in perfect condition. The raw performance exceeded my expectations. A true driver's car!",
    rating: 5,
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
          Discover why discerning individuals choose Falcon Flair Car Rental for their luxury automotive experiences in Dubai
        </p>
      </motion.div>

      <div className="max-w-5xl mx-auto">
        <Card className="relative overflow-hidden">
          <div className="grid md:grid-cols-5 gap-8 p-8 lg:p-12">
            {/* Author info */}
            <div className="md:col-span-2 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <h3 className="text-xl font-medium mb-1">{current.authorName}</h3>
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
