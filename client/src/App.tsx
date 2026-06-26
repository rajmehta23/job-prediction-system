import { useState, useEffect, useRef } from 'react'
import { 
  Briefcase, 
  Award, 
  Code, 
  BookOpen, 
  TrendingUp, 
  Zap, 
  History, 
  RefreshCw, 
  Plus, 
  Minus, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Sparkles,
  Play,
  Sun,
  Moon
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'
import logoImg from './assets/logo.png'

// Interactive Neural/Constellation Background Component
function InteractiveParticles({ isDarkMode }: { isDarkMode: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      color: string
    }> = []

    const particleCount = 65
    const mouse = { x: -1000, y: -1000, radius: 160 }

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        color: isDarkMode 
          ? (i % 3 === 0 ? 'rgba(0, 114, 255, 0.4)' : i % 3 === 1 ? 'rgba(0, 242, 254, 0.4)' : 'rgba(157, 78, 221, 0.4)')
          : (i % 3 === 0 ? 'rgba(0, 114, 255, 0.15)' : i % 3 === 1 ? 'rgba(0, 242, 254, 0.15)' : 'rgba(157, 78, 221, 0.15)'),
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    const handleMouseLeave = () => {
      mouse.x = -1000
      mouse.y = -1000
    }

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('resize', handleResize)

    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 130) {
            ctx.beginPath()
            ctx.strokeStyle = isDarkMode 
              ? `rgba(157, 78, 221, ${0.12 * (1 - dist / 130)})`
              : `rgba(0, 114, 255, ${0.08 * (1 - dist / 130)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius
          p.x += (dx / dist) * force * 1.5
          p.y += (dy / dist) * force * 1.5
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 3
        ctx.fill()
        ctx.shadowBlur = 0
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('resize', handleResize)
    }
  }, [isDarkMode])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-60" />
}

// Fallback Historical Averages in case the API is not up yet
const DEFAULT_STATS = {
  placed_averages: {
    CGPA: 8.21,
    Internships: 2.34,
    Projects: 4.86,
    Certifications: 4.12,
    Aptitude: 80.5,
    Communication: 78.4
  },
  unplaced_averages: {
    CGPA: 6.12,
    Internships: 0.92,
    Projects: 2.15,
    Certifications: 1.45,
    Aptitude: 56.2,
    Communication: 59.8
  },
  overall_averages: {
    CGPA: 7.15,
    Internships: 1.63,
    Projects: 3.51,
    Certifications: 2.78,
    Aptitude: 68.3,
    Communication: 69.1
  }
}

interface PredictionHistory {
  id: string
  timestamp: string
  cgpa: number
  internships: number
  projects: number
  certifications: number
  aptitude: number
  communication: number
  probability: number
  status: string
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000'

export default function App() {
  // Input fields state
  const [cgpa, setCgpa] = useState<number>(7.8)
  const [internships, setInternships] = useState<number>(1)
  const [projects, setProjects] = useState<number>(2)
  const [certifications, setCertifications] = useState<number>(1)
  const [aptitude, setAptitude] = useState<number>(75)
  const [communication, setCommunication] = useState<number>(70)

  // System states
  const [liveMode, setLiveMode] = useState<boolean>(true)
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null)
  const [stats, setStats] = useState<typeof DEFAULT_STATS>(DEFAULT_STATS)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true)
  
  // Prediction result states
  const [probability, setProbability] = useState<number | null>(null)
  const [predictionStatus, setPredictionStatus] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Local evaluation history
  const [history, setHistory] = useState<PredictionHistory[]>([])
  const [showHistory, setShowHistory] = useState<boolean>(false)

  // Initialize theme and health check
  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem('careerpulse_theme')
    if (savedTheme === 'light') {
      setIsDarkMode(false)
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    } else {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    }

    const fetchHealthAndStats = async () => {
      try {
        const healthRes = await fetch(`${BACKEND_URL}/health`)
        if (healthRes.ok) {
          setBackendHealthy(true)
        } else {
          setBackendHealthy(false)
        }
      } catch (err) {
        setBackendHealthy(false)
      }

      try {
        const statsRes = await fetch(`${BACKEND_URL}/stats`)
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }
      } catch (err) {
        console.warn('Backend stats unavailable, using default metrics.', err)
      }
    }

    fetchHealthAndStats()

    // Load history
    const saved = localStorage.getItem('careerpulse_history')
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  // Theme toggle action
  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev
      if (next) {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
        localStorage.setItem('careerpulse_theme', 'dark')
      } else {
        document.documentElement.classList.add('light')
        document.documentElement.classList.remove('dark')
        localStorage.setItem('careerpulse_theme', 'light')
      }
      return next
    })
  }

  // Function to run the placement prediction
  const getPrediction = async (saveToHistory = false) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${BACKEND_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          CGPA: cgpa,
          Internships: internships,
          Projects: projects,
          Certifications: certifications,
          Aptitude: aptitude,
          Communication: communication
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Server error')
      }

      const data = await res.json()
      const probPercent = data.probability * 100
      setProbability(probPercent)
      setPredictionStatus(data.status)

      // Trigger Confetti on High chance
      if (data.status === 'High Chance' && saveToHistory) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#0072ff', '#00f2fe', '#9d4edd', '#00f5d4']
        })
      }

      // Add to local history log
      if (saveToHistory) {
        const newRecord: PredictionHistory = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          cgpa,
          internships,
          projects,
          certifications,
          aptitude,
          communication,
          probability: probPercent,
          status: data.status
        }
        const updatedHistory = [newRecord, ...history].slice(0, 10)
        setHistory(updatedHistory)
        localStorage.setItem('careerpulse_history', JSON.stringify(updatedHistory))
      }

    } catch (err: any) {
      setError(err.message || 'Could not connect to predictor service.')
    } finally {
      setLoading(false)
    }
  }

  // Automatic calculation if in live mode
  useEffect(() => {
    if (liveMode) {
      const timer = setTimeout(() => {
        getPrediction(false)
      }, 250)
      return () => clearTimeout(timer)
    }
  }, [cgpa, internships, projects, certifications, aptitude, communication, liveMode])

  // Run initial prediction once mounted
  useEffect(() => {
    getPrediction(false)
  }, [])

  // Calculate dynamic recommendations based on statistics of Placed students
  const getInsights = () => {
    const insights = []
    const target = stats.placed_averages

    if (cgpa < target.CGPA) {
      insights.push({
        field: 'CGPA',
        text: `Your CGPA (${cgpa}) is below the average placed student CGPA of ${target.CGPA}. Prioritize academics to improve.`,
        urgency: 'high'
      })
    }
    if (internships < Math.round(target.Internships)) {
      insights.push({
        field: 'Internships',
        text: `Placed students average ${target.Internships} internships. Securing ${Math.round(target.Internships) - internships} more will match placed averages.`,
        urgency: 'medium'
      })
    }
    if (projects < Math.round(target.Projects)) {
      insights.push({
        field: 'Projects',
        text: `Your project count (${projects}) is below the placed average (${target.Projects}). Try adding ${Math.round(target.Projects) - projects} hands-on projects.`,
        urgency: 'medium'
      })
    }
    if (certifications < Math.round(target.Certifications)) {
      insights.push({
        field: 'Certifications',
        text: `Placed students average ${target.Certifications} certifications. Focus on ${Math.round(target.Certifications) - certifications} more specialized certifications.`,
        urgency: 'low'
      })
    }
    if (aptitude < target.Aptitude) {
      insights.push({
        field: 'Aptitude',
        text: `Your Aptitude Score is ${aptitude}. Placed students average ${target.Aptitude}. Focus on reasoning mock tests.`,
        urgency: 'high'
      })
    }
    if (communication < target.Communication) {
      insights.push({
        field: 'Communication',
        text: `Your Communication Score (${communication}) is below the placed average (${target.Communication}). Try doing mock interviews.`,
        urgency: 'high'
      })
    }

    if (insights.length === 0) {
      insights.push({
        field: 'Excellence',
        text: 'Outstanding profile! Your scores meet or exceed all placed averages. Maintain this progress.',
        urgency: 'none'
      })
    }

    return insights
  }

  const activeInsights = getInsights()

  // Clear history function
  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('careerpulse_history')
  }

  // Helper color logic based on status
  const getStatusColor = (statusText: string) => {
    switch (statusText) {
      case 'High Chance':
        return 'text-neon-green border-neon-green/30 bg-neon-green/10'
      case 'Moderate Chance':
        return 'text-neon-orange border-neon-orange/30 bg-neon-orange/10'
      case 'Low Chance':
        return 'text-neon-red border-neon-red/30 bg-neon-red/10'
      default:
        return 'text-slate-400 border-slate-700 bg-slate-800/30'
    }
  }

  const getStrokeColor = (statusText: string) => {
    switch (statusText) {
      case 'High Chance':
        return '#00f5d4'
      case 'Moderate Chance':
        return '#ff9f1c'
      case 'Low Chance':
        return '#ff0054'
      default:
        return '#00f2fe'
    }
  }

  return (
    <div className="relative min-h-screen transition-colors duration-400 overflow-x-hidden font-sans pb-16">
      {/* Dynamic neural backdrop */}
      <InteractiveParticles isDarkMode={isDarkMode} />

      {/* Decorative Theme-Aware Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-neon-blue/8 dark:bg-neon-blue/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[45%] h-[45%] rounded-full bg-neon-purple/8 dark:bg-neon-purple/10 blur-[130px] pointer-events-none z-0" />

      {/* Main Content Area */}
      <div className="relative max-w-[92vw] mx-auto px-4 sm:px-6 pt-8 z-10">
        
        {/* Navigation & Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 mb-8 border-b border-glass-border">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-xl bg-gradient-to-tr from-neon-blue/10 to-neon-cyan/10 dark:from-neon-blue/20 dark:to-neon-cyan/20 border border-glass-border hover:border-neon-blue/40 dark:hover:border-neon-cyan/40 hover:scale-108 hover:rotate-2 hover:shadow-glow-blue transition-all duration-300 cursor-pointer select-none">
              <img 
                src={logoImg} 
                alt="Job Prediction Logo" 
                className="w-11 h-11 object-contain rounded-lg transition-transform duration-300"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-outfit bg-clip-text text-transparent bg-gradient-to-r ${isDarkMode ? 'from-white via-slate-200 to-neon-cyan' : 'from-slate-900 via-slate-700 to-neon-blue'}`}>
                  Job Prediction System
                </h1>
                {/* Health dot */}
                <span 
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                    backendHealthy === true 
                      ? 'bg-neon-green shadow-[0_0_8px_rgba(0,245,212,0.6)]' 
                      : 'bg-neon-red animate-pulse'
                  }`} 
                  title={backendHealthy ? "Predictor Connected" : "Local Model Active"}
                />
              </div>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">ML Placement Probability Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Toggle */}
            <label className="inline-flex items-center cursor-pointer select-none">
              <span className="mr-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">Live Compute</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={liveMode} 
                  onChange={() => setLiveMode(!liveMode)} 
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neon-cyan"></div>
              </div>
            </label>

            {/* Day / Night Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-glass-border bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500 transition-all cursor-pointer text-xs font-semibold shadow-sm select-none"
              title={isDarkMode ? "Switch to Day Mode" : "Switch to Night Mode"}
            >
              {isDarkMode ? (
                <>
                  <Sun size={14} className="text-yellow-400" />
                  <span>Day Mode</span>
                </>
              ) : (
                <>
                  <Moon size={14} className="text-indigo-600" />
                  <span>Night Mode</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Dashboard Grid - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* COLUMN 1: Profile Metrics Form */}
          <div className="space-y-8">
            <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-neon-cyan">
                <Sparkles size={80} />
              </div>
              
              <div className="flex items-center gap-2 mb-6">
                <Zap className="text-neon-cyan animate-pulse-slow" size={20} />
                <h2 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">Student Profile Metrics</h2>
              </div>

              {/* Form Input Rows */}
              <div className="space-y-6">
                
                {/* CGPA */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="flex items-center gap-2 text-base font-semibold text-slate-700 dark:text-slate-200">
                      <BookOpen size={16} className="text-neon-cyan" />
                      Cumulative GPA (CGPA)
                    </label>
                    <span className="text-xl font-mono font-bold text-neon-cyan">{cgpa.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="0.0" 
                      max="10.0" 
                      step="0.05"
                      value={cgpa} 
                      onChange={(e) => setCgpa(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neon-cyan focus:outline-none"
                    />
                    <input 
                      type="number" 
                      min="0.0" 
                      max="10.0" 
                      step="0.1"
                      value={cgpa} 
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        if (!isNaN(val)) setCgpa(Math.min(Math.max(val, 0), 10))
                      }}
                      className="w-20 px-2 py-1 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-semibold text-center text-base text-slate-800 dark:text-white focus:outline-none focus:border-neon-cyan"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1.5 font-mono">
                    <span>0.0</span>
                    <span>5.0 (Avg)</span>
                    <span>10.0</span>
                  </div>
                </div>

                {/* Counter row: Internships, Projects, Certifications */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Internships */}
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-glass-border rounded-2xl flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Internships</label>
                      <Briefcase size={16} className="text-neon-blue" />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <button 
                        onClick={() => setInternships(Math.max(0, internships - 1))}
                        className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">{internships}</span>
                      <button 
                        onClick={() => setInternships(Math.min(10, internships + 1))}
                        className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-glass-border rounded-2xl flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Projects</label>
                      <Code size={16} className="text-neon-purple" />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <button 
                        onClick={() => setProjects(Math.max(0, projects - 1))}
                        className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">{projects}</span>
                      <button 
                        onClick={() => setProjects(Math.min(15, projects + 1))}
                        className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-glass-border rounded-2xl flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Certifications</label>
                      <Award size={16} className="text-neon-green" />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <button 
                        onClick={() => setCertifications(Math.max(0, certifications - 1))}
                        className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">{certifications}</span>
                      <button 
                        onClick={() => setCertifications(Math.min(15, certifications + 1))}
                        className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Sliders: Aptitude Score */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="flex items-center gap-2 text-base font-semibold text-slate-700 dark:text-slate-200">
                      <TrendingUp size={16} className="text-neon-purple" />
                      Aptitude Score
                    </label>
                    <span className="text-xl font-mono font-bold text-neon-purple">{aptitude} / 100</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={aptitude} 
                      onChange={(e) => setAptitude(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neon-purple focus:outline-none"
                    />
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={aptitude} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        if (!isNaN(val)) setAptitude(Math.min(Math.max(val, 0), 100))
                      }}
                      className="w-20 px-2 py-1 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-semibold text-center text-base text-slate-800 dark:text-white focus:outline-none focus:border-neon-purple"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1.5 font-mono">
                    <span>0</span>
                    <span>50 (Avg)</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Sliders: Communication Score */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="flex items-center gap-2 text-base font-semibold text-slate-700 dark:text-slate-200">
                      <Award size={16} className="text-neon-green" />
                      Communication Score
                    </label>
                    <span className="text-xl font-mono font-bold text-neon-green">{communication} / 100</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={communication} 
                      onChange={(e) => setCommunication(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neon-green focus:outline-none"
                    />
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={communication} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        if (!isNaN(val)) setCommunication(Math.min(Math.max(val, 0), 100))
                      }}
                      className="w-20 px-2 py-1 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-semibold text-center text-base text-slate-800 dark:text-white focus:outline-none focus:border-neon-green"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1.5 font-mono">
                    <span>0</span>
                    <span>50 (Avg)</span>
                    <span>100</span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-glass-border">
                {!liveMode && (
                  <button 
                    onClick={() => getPrediction(true)}
                    disabled={loading}
                    className="flex-1 py-3 px-6 rounded-xl font-bold bg-gradient-to-tr from-neon-blue to-neon-cyan text-dark-bg shadow-glow-cyan hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : (
                      <Play size={18} />
                    )}
                    Run Prediction Model
                  </button>
                )}
                {liveMode && (
                  <button 
                    onClick={() => getPrediction(true)}
                    disabled={loading}
                    className="flex-1 py-3 px-6 rounded-xl font-bold border border-neon-cyan/40 bg-neon-cyan/5 text-neon-cyan hover:bg-neon-cyan/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle size={18} />
                    Log Current Profile state
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* COLUMN 2: Gauge & Comparisons */}
          <div className="space-y-8">
            
            {/* Probability Gauge Box */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden text-center">
              
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">
                Placement Success Potential
              </h2>

              <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="84"
                    className="stroke-slate-200 dark:stroke-slate-800"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="84"
                    stroke={getStrokeColor(predictionStatus)}
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 84}
                    initial={{ strokeDashoffset: 2 * Math.PI * 84 }}
                    animate={{ 
                      strokeDashoffset: 2 * Math.PI * 84 * (1 - (probability !== null ? probability / 100 : 0)) 
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    strokeLinecap="round"
                    style={{
                      filter: `drop-shadow(0 0 8px ${getStrokeColor(predictionStatus)}44)`
                    }}
                  />
                </svg>
                
                <div className="absolute flex flex-col items-center justify-center">
                  {loading ? (
                    <RefreshCw className="text-neon-cyan animate-spin" size={32} />
                  ) : (
                    <>
                      <span className="text-5xl font-extrabold font-outfit text-slate-900 dark:text-white font-mono">
                        {probability !== null ? `${probability.toFixed(1)}%` : '---'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-widest uppercase mt-1">
                        PROBABILITY
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Status Indicator */}
              <AnimatePresence mode="wait">
                {probability !== null && !loading && (
                  <motion.div
                    key={predictionStatus}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`px-5 py-2 rounded-2xl border text-base font-bold shadow-sm flex items-center gap-2 ${getStatusColor(predictionStatus)}`}
                  >
                    <Sparkles size={16} />
                    {predictionStatus}
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="mt-4 p-3 bg-neon-red/10 border border-neon-red/30 rounded-xl flex items-center gap-2 text-xs text-neon-red">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Profile Comparison Chart */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={20} className="text-neon-cyan" />
                <h3 className="text-xl font-bold font-outfit text-slate-900 dark:text-white">Target Averages Comparison</h3>
              </div>

              <div className="space-y-5">
                
                {[
                  { name: 'CGPA', current: cgpa, max: 10, target: stats.placed_averages.CGPA },
                  { name: 'Internships', current: internships, max: 5, target: stats.placed_averages.Internships },
                  { name: 'Projects', current: projects, max: 8, target: stats.placed_averages.Projects },
                  { name: 'Certifications', current: certifications, max: 8, target: stats.placed_averages.Certifications },
                  { name: 'Aptitude', current: aptitude, max: 100, target: stats.placed_averages.Aptitude },
                  { name: 'Communication', current: communication, max: 100, target: stats.placed_averages.Communication }
                ].map((item, idx) => {
                  const currentPercent = Math.min((item.current / item.max) * 100, 100)
                  const targetPercent = Math.min((item.target / item.max) * 100, 100)
                  
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                        <div className="flex gap-2.5 font-mono text-xs">
                          <span className="text-neon-cyan">You: {item.current}</span>
                          <span className="text-neon-green">Avg Placed: {item.target}</span>
                        </div>
                      </div>
                      
                      <div className="relative h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-glass-border">
                        {/* Target Line Mark */}
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 bg-neon-green/80 z-20"
                          style={{ left: `${targetPercent}%` }}
                          title={`Average Placed: ${item.target}`}
                        />
                        
                        {/* Current Progress bar */}
                        <div 
                          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-neon-blue to-neon-cyan rounded-full z-10 transition-all duration-500"
                          style={{ width: `${currentPercent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}

              </div>
              
              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-glass-border text-xs text-slate-500 dark:text-slate-400 font-mono justify-center">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-neon-cyan rounded-full" /> Your Profile</span>
                <span className="flex items-center gap-1"><span className="w-0.5 h-3 bg-neon-green rounded-full" /> Placed Average</span>
              </div>
            </div>
          </div>

        </div>

        {/* Full-Width Sections Below the Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            
            {/* Profile Insights Recommendation Section */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Info className="text-neon-purple" size={20} />
                  <h3 className="text-xl font-bold font-outfit text-slate-900 dark:text-white">Interactive Recommendations</h3>
                </div>
                <span className="text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono px-2.5 py-1 rounded border border-glass-border">
                  AI Checklist
                </span>
              </div>

              <div className="space-y-4">
                {activeInsights.map((insight, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                      insight.urgency === 'high' 
                        ? 'bg-red-50/50 dark:bg-neon-red/5 border-red-200 dark:border-neon-red/20' 
                        : insight.urgency === 'medium'
                          ? 'bg-orange-50/50 dark:bg-neon-orange/5 border-orange-200 dark:border-neon-orange/20'
                          : insight.urgency === 'low'
                            ? 'bg-blue-50/50 dark:bg-neon-blue/5 border-blue-200 dark:border-neon-blue/20'
                            : 'bg-emerald-50/50 dark:bg-neon-green/5 border-emerald-200 dark:border-neon-green/20'
                    }`}
                  >
                    <div className="mt-0.5">
                      {insight.urgency === 'high' ? (
                        <span className="flex w-2.5 h-2.5 rounded-full bg-neon-red shadow-[0_0_8px_rgba(255,0,84,0.6)]" />
                      ) : insight.urgency === 'medium' ? (
                        <span className="flex w-2.5 h-2.5 rounded-full bg-neon-orange shadow-[0_0_8px_rgba(255,159,28,0.6)]" />
                      ) : insight.urgency === 'low' ? (
                        <span className="flex w-2.5 h-2.5 rounded-full bg-neon-blue shadow-[0_0_8px_rgba(0,114,255,0.6)]" />
                      ) : (
                        <span className="flex w-2.5 h-2.5 rounded-full bg-neon-green shadow-[0_0_8px_rgba(0,245,212,0.6)]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {insight.field}
                      </h4>
                      <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">{insight.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* History Panel */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8">
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between text-slate-900 dark:text-white font-bold font-outfit focus:outline-none cursor-pointer"
              >
                <div className="flex items-center gap-2 text-base sm:text-lg">
                  <History size={18} className="text-neon-purple" />
                  <span>Evaluation Logs</span>
                </div>
                <span className="text-sm font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-glass-border px-2.5 py-1 rounded">
                  {history.length} Logged
                </span>
              </button>

              <AnimatePresence>
                {showHistory && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-4 pt-4 border-t border-glass-border space-y-3"
                  >
                    {history.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">No evaluations logged yet. Click "Log Current Profile State" to record a snapshot.</p>
                    ) : (
                      <>
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                          {history.map((record) => (
                            <div key={record.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-glass-border rounded-xl flex items-center justify-between text-sm">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-slate-500 dark:text-slate-400">{record.timestamp}</span>
                                  <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-semibold font-mono">GPA: {record.cgpa}</span>
                                </div>
                                <div className="flex gap-2 mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
                                  <span>Int: {record.internships}</span>
                                  <span>Proj: {record.projects}</span>
                                  <span>Apt: {record.aptitude}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-bold font-mono text-slate-900 dark:text-white block">{record.probability.toFixed(1)}%</span>
                                <span className={`text-xs font-bold uppercase tracking-wider ${
                                  record.status === 'High Chance' ? 'text-neon-green' : record.status === 'Moderate Chance' ? 'text-neon-orange' : 'text-neon-red'
                                }`}>
                                  {record.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button 
                          onClick={clearHistory}
                          className="w-full text-center text-xs text-neon-red hover:underline mt-2 font-semibold cursor-pointer"
                        >
                          Clear Evaluation Logs
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

        </div>

      </div>
    </div>
  )
}
