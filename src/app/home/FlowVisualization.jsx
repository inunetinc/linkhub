import { motion } from "framer-motion"
import { Youtube, Instagram, Music2 } from "lucide-react"

export default function FlowVisualization() {
  return (
    <div className="relative w-full h-[420px] flex items-center justify-center">
      {/* SVG */}
      <svg
        viewBox="0 0 600 400"
        className="absolute inset-0 w-full h-full"
      >
        {/* Brand → Creator */}
        <motion.path
          d="M140 200 C 220 200, 260 200, 300 200"
          stroke="url(#grad)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />

        {/* Creator → Channels */}
        {[
          "M300 200 C 360 140, 430 120, 500 110",
          "M300 200 C 360 200, 430 200, 500 200",
          "M300 200 C 360 260, 430 280, 500 290",
        ].map((d, i) => (
          <motion.path
            key={i}
            d={d}
            stroke="url(#grad)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, delay: 0.2 + i * 0.2 }}
          />
        ))}

        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>

      {/* Brand */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute left-[90px] top-1/2 -translate-y-1/2
                   bg-white/80 backdrop-blur-xl px-6 py-4 rounded-2xl
                   shadow-lg border"
      >
        <span className="font-semibold text-gray-800">Brand</span>
      </motion.div>

      {/* Creator */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                   bg-white/90 backdrop-blur-xl px-7 py-4 rounded-2xl
                   shadow-xl border"
      >
        <span className="font-semibold text-gray-800">Creator</span>
      </motion.div>

      {/* Channels */}
      <div className="absolute right-[70px] top-1/2 -translate-y-1/2 flex flex-col gap-6">
        {[Youtube, Instagram, Music2].map((Icon, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.35,
              ease: "easeInOut",
            }}
            className="w-12 h-12 rounded-full bg-white shadow-lg
                       flex items-center justify-center"
          >
            <Icon className="w-6 h-6 text-teal-600" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
