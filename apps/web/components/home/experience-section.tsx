'use client'

import { motion } from 'framer-motion'
import { Shield, Clock, Camera, MapPin } from 'lucide-react'
import Image from 'next/image'
import { fadeInUp, staggerContainer, staggerItem } from '@valore/ui'

const experiences = [
  {
    icon: Shield,
    title: 'Self-Drive Excellence',
    description: 'Take the wheel of automotive perfection with comprehensive insurance and 24/7 support',
    image: '/Ferrari 488 - red.jpg'
  },
  {
    icon: Clock,
    title: 'Chauffeur Service',
    description: 'Professional drivers trained to deliver comfort and discretion for your journey',
    image: '/McLaren Blue.jpg'
  },
  {
    icon: Camera,
    title: 'Photoshoot Package',
    description: 'Capture your experience with professional photographers and stunning locations',
    image: '/Lamborghini Urus Performante Blue.jpg'
  },
  {
    icon: MapPin,
    title: 'Curated Experiences',
    description: 'Exclusive driving routes, private track days, and bespoke automotive adventures',
    image: '/G63-white.jpg'
  },
]

export function ExperienceSection() {
  return (
    <section className="section-spacing bg-black text-white overflow-hidden">
      <div className="container-luxury">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
          >
            <p className="text-luxury text-primary mb-4">The Midwest Luxury Difference</p>
            <h2 className="heading-large mb-8">
              Crafted for the
              <span className="block gradient-text">Extraordinary</span>
            </h2>
            <p className="text-xl text-neutral-300 mb-12 leading-relaxed">
              Every detail meticulously curated to deliver an unparalleled luxury experience. 
              From the moment you inquire to the memories that last forever.
            </p>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="space-y-6"
            >
              {experiences.map((item, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">{item.title}</h3>
                    <p className="text-neutral-400">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Video */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            <div className="relative aspect-[9/16] rounded-2xl overflow-hidden">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/MidwestLuxuryRentalsVideo1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            
            {/* Floating card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute -bottom-8 -left-8 bg-white text-black p-6 rounded-xl shadow-luxury-lg max-w-xs"
            >
              <p className="text-4xl font-display mb-2">5+</p>
              <p className="text-sm text-neutral-600">Years of Excellence</p>
              <p className="text-sm text-neutral-600">Serving Discerning Clients Across the Midwest</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
