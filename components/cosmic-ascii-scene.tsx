"use client";

import { useEffect, useRef, useState } from "react"
import cosmicData from "@/data/cosmic-entities.json"

interface CosmicSceneProps {
  isInteractiveMode: boolean
  manualScene?: number
}

interface WeatherData {
  temperature: number
  weatherCode: number
  isDay: boolean
}

interface CosmicEntity {
  id: number
  name: string
  type: string
  colorPalette: {
    primary: string
    secondary: string
    accent: string
  }
  animationStyle: string
  duration: number
}

const COSMIC_ENTITIES: CosmicEntity[] = cosmicData.entities

const GLOBAL_TIME_SCALE = 3
const ELEMENT_STAGGER_MS = 200

function staggerTime(time: number, index: number, extraOffset = 0) {
  return time - (index + extraOffset) * ELEMENT_STAGGER_MS
}

type BaseStyle = "drift" | "swirl" | "pulse" | "twinkle" | "wave" | "orbit" | "flare" | "ripple"

interface StyleVariant {
  baseStyle: BaseStyle
  /** Multiplier applied to motion speed */
  speedMultiplier: number
  /** Controls particle/star density */
  densityMultiplier: number
  /** General intensity parameter mapped to amplitudes */
  intensity: number
  /** Phase offset used for oscillations */
  oscillationPhase: number
  /** Additional distortion/warp factor */
  distortion: number
  /** Deterministic seed extracted from hash for consistent randomness */
  seed: number
}

const BASE_STYLES: BaseStyle[] = ["drift", "swirl", "pulse", "twinkle", "wave", "orbit", "flare", "ripple"]

const TYPE_STYLE_BIAS: Record<string, BaseStyle[]> = {
  blackhole: ["swirl", "ripple", "flare"],
  sun: ["pulse", "flare", "wave"],
  star: ["twinkle", "pulse", "wave"],
  pulsar: ["pulse", "flare"],
  nebula: ["wave", "ripple", "drift"],
  galaxy: ["swirl", "drift", "ripple"],
  cluster: ["twinkle", "pulse", "ripple"],
  quasar: ["flare", "swirl", "pulse"],
  supernova: ["flare", "wave", "pulse"],
  exoplanet: ["orbit", "drift", "wave"],
  rings: ["orbit", "ripple", "drift"],
  comet: ["drift", "ripple", "flare"],
  meteoroid: ["drift", "flare", "wave"],
  asteroid: ["drift", "orbit", "ripple"],
  moon: ["orbit", "twinkle", "wave"],
  cloud: ["ripple", "wave", "drift"],
  structure: ["swirl", "ripple", "drift"],
  stream: ["wave", "drift", "ripple"],
  rogueplanet: ["orbit", "drift", "pulse"],
  phenomena: ["flare", "wave", "pulse"],
  wave: ["wave", "ripple", "drift"],
  magnetar: ["pulse", "flare", "swirl"],
  burst: ["flare", "pulse", "wave"],
  core: ["swirl", "pulse", "flare"],
  background: ["ripple", "drift", "wave"],
  halo: ["ripple", "swirl", "orbit"],
  browndwarf: ["pulse", "flare", "twinkle"],
  void: ["drift", "ripple", "swirl"],
  boundary: ["wave", "ripple", "flare"],
  belt: ["orbit", "drift", "ripple"],
  dwarfplanet: ["orbit", "pulse", "drift"],
  supercluster: ["swirl", "twinkle", "ripple"],
  frb: ["flare", "pulse", "twinkle"],
}

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return hash
}

function getStyleVariant(animationStyle: string, entityType: string): StyleVariant {
  const hash = Math.abs(hashString(animationStyle || entityType || "cosmic"))
  const bias = TYPE_STYLE_BIAS[entityType] ?? BASE_STYLES
  const baseStyle = bias[hash % bias.length]

  const take = (shift: number, mask = 0xff) => ((hash >> shift) & mask) / mask

  const speedMultiplier = 0.6 + take(2) * 2.2
  const densityMultiplier = 0.7 + take(10) * 2.5
  const intensity = 0.5 + take(18) * 1.5
  const oscillationPhase = take(24) * Math.PI * 2
  const distortion = take(5, 0x3f) // 0-1 roughly

  return {
    baseStyle,
    speedMultiplier,
    densityMultiplier,
    intensity,
    oscillationPhase,
    distortion,
    seed: hash,
  }
}

export function CosmicASCIIScene({ isInteractiveMode, manualScene = 0 }: CosmicSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [currentEntityIndex, setCurrentEntityIndex] = useState(0)
  const [nextEntityIndex, setNextEntityIndex] = useState(1)
  const [transitionProgress, setTransitionProgress] = useState(0)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const lastSceneChangeRef = useRef(Date.now())
  const particlesRef = useRef<any[]>([])
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [shouldAnimate, setShouldAnimate] = useState(true)
  const staticTimeRef = useRef<number>(Date.now())

  interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    life: number
    maxLife: number
    char: string
    color: string
  }

  // Fetch weather data for Kolkata
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=22.5726&longitude=88.3639&current=temperature_2m,weather_code,is_day&timezone=Asia%2FKolkata",
        )
        const data = await response.json()
        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          weatherCode: data.current.weather_code,
          isDay: data.current.is_day === 1,
        })
      } catch (error) {
        console.error("Failed to fetch weather:", error)
      }
    }

    fetchWeather()
    const weatherInterval = setInterval(fetchWeather, 600000)
    return () => clearInterval(weatherInterval)
  }, [])

  // Update time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timeInterval)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updateShouldAnimate = () => setShouldAnimate(!mediaQuery.matches)
    updateShouldAnimate()
    mediaQuery.addEventListener("change", updateShouldAnimate)
    return () => mediaQuery.removeEventListener("change", updateShouldAnimate)
  }, [])

  useEffect(() => {
    if (isInteractiveMode) return

    const checkSceneChange = () => {
      const now = Date.now()
      const elapsed = now - lastSceneChangeRef.current
      const currentEntity = COSMIC_ENTITIES[currentEntityIndex]
      const transitionDuration = 1000 // 1 second crossfade

      if (elapsed >= currentEntity.duration + transitionDuration) {
        // Complete transition
        setCurrentEntityIndex(nextEntityIndex)
        setNextEntityIndex((nextEntityIndex + 1) % COSMIC_ENTITIES.length)
        lastSceneChangeRef.current = now
        setTransitionProgress(0)
        setIsTransitioning(false)
      } else if (elapsed >= currentEntity.duration && !isTransitioning) {
        // Start transition
        setIsTransitioning(true)
      } else if (isTransitioning) {
        // Update transition progress
        const transitionElapsed = elapsed - currentEntity.duration
        setTransitionProgress(transitionElapsed / transitionDuration)
      }
    }

    const interval = setInterval(checkSceneChange, 16) // ~60fps
    return () => clearInterval(interval)
  }, [currentEntityIndex, nextEntityIndex, isInteractiveMode, isTransitioning])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return

    const updateSize = () => {
      const parent = canvas.parentElement
      if (parent) {
        const { clientWidth, clientHeight } = parent
        canvas.width = Math.max(320, clientWidth)
        canvas.height = Math.max(240, clientHeight)
      } else {
        const isMobile = window.innerWidth < 1024
        canvas.width = Math.min(isMobile ? window.innerWidth : window.innerWidth / 2, 1920)
        canvas.height = isMobile ? Math.max(240, window.innerHeight * 0.55) : Math.min(window.innerHeight, 1080)
      }
    }
    updateSize()
    window.addEventListener("resize", updateSize)

    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 200; i++) {
        particlesRef.current.push(createParticle(canvas.width, canvas.height))
      }
    }

    const render = () => {
      const width = canvas.width
      const height = canvas.height
      const activeEntityIndex = isInteractiveMode ? manualScene % COSMIC_ENTITIES.length : currentEntityIndex
      const entity = COSMIC_ENTITIES[activeEntityIndex]
      const entityVariant = getStyleVariant(entity.animationStyle, entity.type)
      canvas.style.setProperty("--accent", entity.colorPalette.accent)
      if (canvas.parentElement) {
        canvas.parentElement.style.setProperty("--accent", entity.colorPalette.accent)
      }
      const now = shouldAnimate ? Date.now() : staticTimeRef.current
      if (!shouldAnimate) {
        staticTimeRef.current = now
      }
      const slowTime = now / GLOBAL_TIME_SCALE

      // Clear canvas
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, width, height)

      const desktopThreshold = 700
      const mobileThreshold = 480
      const threshold = width < 640 ? mobileThreshold : desktopThreshold
      const scaleFactor = Math.min(1, Math.max(0.6, width / threshold))
      const scaledWidth = width / scaleFactor
      const scaledHeight = height / scaleFactor

      if (isTransitioning && !isInteractiveMode) {
        const currentEntity = COSMIC_ENTITIES[currentEntityIndex]
        const nextEntity = COSMIC_ENTITIES[nextEntityIndex]
        const currentVariant = getStyleVariant(currentEntity.animationStyle, currentEntity.type)
        const nextVariant = getStyleVariant(nextEntity.animationStyle, nextEntity.type)

        // Render current scene
        ctx.save()
        ctx.globalAlpha = 1 - transitionProgress
        ctx.scale(scaleFactor, scaleFactor)
        renderEntity(ctx, scaledWidth, scaledHeight, slowTime, currentEntity, particlesRef.current, currentVariant)
        ctx.restore()

        // Render next scene
        ctx.save()
        ctx.globalAlpha = transitionProgress
        ctx.scale(scaleFactor, scaleFactor)
        renderEntity(ctx, scaledWidth, scaledHeight, slowTime, nextEntity, particlesRef.current, nextVariant)
        ctx.restore()

        ctx.globalAlpha = 1
      } else {
        ctx.save()
        ctx.scale(scaleFactor, scaleFactor)
        renderEntity(ctx, scaledWidth, scaledHeight, slowTime, entity, particlesRef.current, entityVariant)
        ctx.restore()
      }

      drawEnhancedASCIIOverlay(ctx, width, height, currentTime, weather, entity, entityVariant)

      applyEnhancedDithering(ctx, width, height, entity.colorPalette)

      if (shouldAnimate) {
        animationRef.current = requestAnimationFrame(render)
      }
    }

    render()

    return () => {
      window.removeEventListener("resize", updateSize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [
    currentEntityIndex,
    nextEntityIndex,
    transitionProgress,
    currentTime,
    weather,
    isInteractiveMode,
    manualScene,
    isTransitioning,
    shouldAnimate,
  ])

  return <canvas ref={canvasRef} className="w-full h-full cosmic-anim" />
}

function renderEntity(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  entity: CosmicEntity,
  particles: any[],
  variant: StyleVariant,
) {
  const targetParticleCount = Math.max(40, Math.floor(90 * variant.densityMultiplier))
  while (particles.length < targetParticleCount) {
    particles.push(createParticle(width, height, variant, entity.colorPalette))
  }
  while (particles.length > targetParticleCount) {
    particles.pop()
  }

  // Draw background star field
  drawStarField(ctx, width, height, time, entity.colorPalette, variant)

  // Update and draw particles
  updateParticles(particles, width, height, entity.colorPalette, variant)
  drawParticles(ctx, particles, variant)

  // Render entity based on type
  switch (entity.type) {
    case "meteoroid":
    case "comet":
      drawMeteoroidField(ctx, width, height, time, entity.colorPalette, variant)
      break
    case "blackhole":
      drawBlackHole(ctx, width, height, time, entity.colorPalette, variant)
      break
    case "sun":
    case "star":
      drawStar(ctx, width, height, time, entity.colorPalette, variant, entity.type === "sun")
      break
    case "pulsar":
      drawPulsar(ctx, width, height, time, entity.colorPalette, variant)
      break
    case "nebula":
      drawNebula(ctx, width, height, time, entity.colorPalette, variant)
      break
    case "galaxy":
      drawGalaxy(ctx, width, height, time, entity.colorPalette, variant)
      break
    case "cluster":
      drawStarCluster(ctx, width, height, time, entity.colorPalette, variant)
      break
    case "quasar":
      drawQuasar(ctx, width, height, time, entity.colorPalette, variant)
      break
    case "supernova":
      drawSupernovaRemnant(ctx, width, height, time, entity.colorPalette, variant)
      break
    case "exoplanet":
      drawExoplanet(ctx, width, height, time, entity.colorPalette, variant)
      break
    case "rings":
      drawPlanetaryRings(ctx, width, height, time, entity.colorPalette, variant)
      break
  }
}

function createParticle(
  width: number,
  height: number,
  variant?: StyleVariant,
  colors?: {
    primary: string
    secondary: string
    accent: string
  },
): any {
  const seed = variant?.seed ?? Math.random() * 1000
  const charSet = variant
    ? ["·", "∙", "•", "○", "✶", "✷", "✸", "✹", "✺", "✻"]
    : ["·", "∙", "•", "○"]
  const char = charSet[Math.abs(Math.floor(seed) + Math.floor(Math.random() * charSet.length)) % charSet.length]
  const palette = colors ? [colors.primary, colors.secondary, colors.accent] : ["#FFFFFF"]
  const color = palette[Math.abs(Math.floor(seed / 3)) % palette.length]

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    life: Math.random() * 100,
    maxLife: 100,
    char,
    color,
  }
}

function updateParticles(
  particles: any[],
  width: number,
  height: number,
  colors: any,
  variant: StyleVariant,
) {
  const speedFactor = 0.4 * variant.speedMultiplier
  particles.forEach((p) => {
    p.x += p.vx * speedFactor
    p.y += p.vy * speedFactor
    p.life -= 0.4 + variant.intensity * 0.2

    if (p.life <= 0 || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
      p.x = Math.random() * width
      p.y = Math.random() * height
      p.life = p.maxLife
      const palette = [colors.primary, colors.secondary, colors.accent]
      const offset = Math.abs(Math.sin(variant.seed + p.life)) * palette.length
      p.color = palette[Math.floor(offset) % palette.length]
      p.vx = (Math.random() - 0.5) * variant.speedMultiplier
      p.vy = (Math.random() - 0.5) * variant.speedMultiplier
    }
  })
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: any[], variant: StyleVariant) {
  const fontSize = 10 + variant.intensity * 4
  ctx.font = `${fontSize}px monospace`
  particles.forEach((p) => {
    const alpha = p.life / p.maxLife
    const fade = Math.min(1, Math.pow(alpha, 0.8))
    ctx.fillStyle = withAlpha(p.color, fade)
    ctx.fillText(p.char, p.x, p.y)
  })
}

function drawStarField(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: any,
  variant: StyleVariant,
) {
  const starCount = Math.floor(110 * variant.densityMultiplier)
  const twinkleSpeed = 700 / variant.speedMultiplier
  const glyphs = variant.baseStyle === "twinkle" ? ["✶", "✷", "✸"] : ["·", "∙", "•"]

  ctx.font = `${9 + variant.intensity * 3}px monospace`
  for (let i = 0; i < starCount; i++) {
    const starTime = staggerTime(time, i)
    const x = (i * 137.5 + (variant.seed % 97)) % width
    const y = (i * 73.3 + (variant.seed % 53)) % height
    const twinkle = Math.sin(starTime / twinkleSpeed + i + variant.oscillationPhase) * 0.5 + 0.5
    const char = glyphs[i % glyphs.length]
    ctx.fillStyle = withAlpha(colors.accent, 0.25 + twinkle * 0.6)
    ctx.fillText(char, x, y)
  }
}

function drawMeteoroidField(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
  variant: StyleVariant,
) {
  const streams = Math.floor(70 * variant.densityMultiplier)
  const baseSpeed = variant.baseStyle === "drift" ? 28 : 22
  const speed = baseSpeed / (0.6 + variant.speedMultiplier * 0.5)
  const driftAngle = ((variant.seed % 360) * Math.PI) / 180
  const trailLength = Math.max(4, Math.floor(variant.intensity * 10))
  const palette = [colors.primary, colors.secondary, colors.accent]
  const chars = variant.baseStyle === "flare" ? ["✦", "✧", "✩", "✪"] : ["·", "°", "*", "∙", "○", "●"]

  ctx.font = `${14 + variant.intensity * 6}px monospace`

  for (let i = 0; i < streams; i++) {
    const offset = i * 131.3 + variant.seed * 3
    const streamTime = staggerTime(time, i)
    const baseX = ((offset + streamTime / speed) % (width + 200)) - 100
    const baseY = ((i * 67.7 + streamTime / (speed * 0.7)) % (height + 200)) - 100

    for (let trail = 0; trail < trailLength; trail++) {
      const fade = 1 - trail / trailLength
      const x = baseX - Math.cos(driftAngle) * trail * 14
      const y = baseY - Math.sin(driftAngle) * trail * (10 + variant.distortion * 12)
      const char = chars[(i + trail) % chars.length]
      const color = palette[(i + trail) % palette.length]

      ctx.fillStyle = withAlpha(color, 0.35 + fade * 0.55)
      ctx.fillText(char, x, y)
    }
  }
}

function drawBlackHole(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
  variant: StyleVariant,
) {
  const centerX = width / 2
  const centerY = height / 2
  const chars = ["○", "●", "◉", "◎", "⊙", "⊚"]

  ctx.font = `${18 + variant.intensity * 6}px monospace`

  // Event horizon
  ctx.fillStyle = colors.primary
  ctx.beginPath()
  ctx.arc(centerX, centerY, 45 + variant.intensity * 15, 0, Math.PI * 2)
  ctx.fill()

  // Swirling accretion disk
  const ringCount = Math.floor(8 + variant.densityMultiplier * 6)
  for (let ring = 1; ring <= ringCount; ring++) {
    const ringTime = staggerTime(time, ring)
    const radius = 60 + ring * (20 + variant.distortion * 12)
    const numChars = Math.floor(radius / 5)
    const ringRotation = ((variant.speedMultiplier * ringTime) / 900) * (ring % 2 === 0 ? 1 : -1)

    for (let i = 0; i < numChars; i++) {
      const angle = (i / numChars) * Math.PI * 2 + ringRotation
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      const char = chars[ring % chars.length]

      const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
      const intensity = 1 - distanceFromCenter / (width / 2)

      ctx.fillStyle = intensity > 0.6 ? colors.secondary : intensity > 0.3 ? colors.accent : colors.primary
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle + variant.distortion)
      ctx.fillText(char, 0, 0)
      ctx.restore()
    }
  }

  // Gravitational lensing effect
  const pulse = Math.sin(time / (350 / variant.speedMultiplier) + variant.oscillationPhase) * 0.3 + 0.7
  ctx.fillStyle = withAlpha(colors.secondary, 0.3 + pulse * 0.5)
  ctx.font = `${26 + variant.intensity * 4}px monospace`
  ctx.fillText("◉", centerX - 14, centerY + 10)
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
  variant: StyleVariant,
  isSun: boolean,
) {
  const centerX = width / 2
  const centerY = height / 2
  const baseRadius = (isSun ? 90 : 70) + variant.intensity * 10

  // Corona/flares
  ctx.font = `${16 + variant.intensity * 4}px monospace`
  const flareChars = ["╱", "╲", "│", "─", "╳", "✦", "✧", "✶"]
  const numFlares = Math.floor((isSun ? 24 : 16) * variant.densityMultiplier)

  for (let i = 0; i < numFlares; i++) {
    const flareTime = staggerTime(time, i)
    const angle = (i / numFlares) * Math.PI * 2 + flareTime / 1000
    const pulse = Math.sin(flareTime / (280 / variant.speedMultiplier) + i + variant.oscillationPhase) * (20 + variant.intensity * 25)
    const flareLength = 60 + pulse
    const x = centerX + Math.cos(angle) * (baseRadius + flareLength)
    const y = centerY + Math.sin(angle) * (baseRadius + flareLength)
    const char = flareChars[i % flareChars.length]

    const colorIndex = i % 3
    ctx.fillStyle = [colors.primary, colors.secondary, colors.accent][colorIndex]
    ctx.fillText(char, x, y)
  }

  // Star core with layered detail
  ctx.font = `${20 + variant.intensity * 6}px monospace`
  const coreChars = ["@", "O", "◉", "●", "⊙", "⊚"]
  const gridSize = 10

  for (let dy = -gridSize; dy <= gridSize; dy++) {
    for (let dx = -gridSize; dx <= gridSize; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist <= gridSize) {
        const x = centerX + dx * 10
        const y = centerY + dy * 10
        const char = coreChars[Math.floor(dist) % coreChars.length]
        const brightness = 1 - dist / gridSize

        const palette = brightness > 0.7 ? colors.primary : brightness > 0.4 ? colors.secondary : colors.accent
        ctx.fillStyle = palette
        ctx.fillText(char, x, y)
      }
    }
  }

  // Twinkle effect for stars
  if (variant.baseStyle === "twinkle") {
    ctx.font = `${26 + variant.intensity * 6}px monospace`
    const twinkle = Math.sin(time / (220 / variant.speedMultiplier) + variant.oscillationPhase) * 0.5 + 0.5
    ctx.fillStyle = withAlpha(colors.secondary, 0.3 + twinkle * 0.6)
    ctx.fillText("✦", centerX - 15, centerY + 10)
  }
}

function drawPulsar(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
  variant: StyleVariant,
) {
  const centerX = width / 2
  const centerY = height / 2
  const pulse = Math.sin(time / (180 / variant.speedMultiplier) + variant.oscillationPhase) * 0.5 + 0.5

  // Pulsating core
  ctx.font = `${22 + variant.intensity * 6}px monospace`
  ctx.fillStyle = colors.primary
  ctx.fillText("⊙", centerX - 12, centerY + 8)

  // Radiation beams
  ctx.font = `${14 + variant.intensity * 4}px monospace`
  const beamChars = ["│", "║", "┃"]
  const beamSpread = 220 + variant.densityMultiplier * 80

  for (let i = 0; i < 2; i++) {
    const beamTime = staggerTime(time, i)
    const angle = beamTime / (450 / variant.speedMultiplier) + i * Math.PI
    for (let dist = 30; dist < beamSpread; dist += 15) {
      const x = centerX + Math.cos(angle) * dist
      const y = centerY + Math.sin(angle) * dist
      const intensity = 1 - dist / beamSpread

      ctx.fillStyle = withAlpha(colors.secondary, Math.max(0.2, intensity * pulse))
      ctx.fillText(beamChars[Math.floor(dist / 15) % beamChars.length], x, y)
    }
  }

  // Magnetic field lines
  ctx.font = `${10 + variant.intensity * 2}px monospace`
  const rings = Math.floor(4 + variant.densityMultiplier * 3)
  for (let ring = 1; ring <= rings; ring++) {
    const radius = 40 + ring * (18 + variant.distortion * 10)
    const numPoints = Math.floor(radius / 4)

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      ctx.fillStyle = withAlpha(colors.accent, 0.5)
      ctx.fillText("·", x, y)
    }
  }
}

function drawNebula(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
  variant: StyleVariant,
) {
  const centerX = width / 2
  const centerY = height / 2
  const chars = ["░", "▒", "▓", "█", "▪", "▫"]

  ctx.font = `${18 + variant.intensity * 6}px monospace`

  const cloudPoints = Math.floor(260 * variant.densityMultiplier)
  const waveAmplitude = 20 + variant.intensity * 40
  const swirlBias = variant.baseStyle === "swirl" || variant.baseStyle === "ripple"
  const flowSpeed = 900 / variant.speedMultiplier

  for (let i = 0; i < cloudPoints; i++) {
    const localTime = staggerTime(time, i)
    const angle = (i / cloudPoints) * Math.PI * 2 + (swirlBias ? variant.distortion : 0)
    const radius = 40 + Math.random() * 160 * (0.6 + variant.densityMultiplier * 0.4)
    const wave = Math.sin(localTime / flowSpeed + i * 0.12 + variant.oscillationPhase) * waveAmplitude
    const drift = Math.cos(localTime / (600 / variant.speedMultiplier) + i) * variant.distortion * 80

    const x = centerX + Math.cos(angle) * (radius + wave) + drift
    const y = centerY + Math.sin(angle) * (radius * 0.6 + wave * 0.4)

    const density = Math.random()
    const char = chars[Math.floor(density * chars.length)]
    const paletteIndex = (Math.floor((density + variant.distortion) * 3) + i) % 3

    ctx.fillStyle = withAlpha(
      [colors.primary, colors.secondary, colors.accent][paletteIndex],
      0.25 + density * 0.55,
    )
    ctx.fillText(char, x, y)
  }

  // Bright emission regions and filaments
  ctx.font = `${22 + variant.intensity * 4}px monospace`
  const hotspots = Math.floor(6 + variant.densityMultiplier * 6)
  for (let i = 0; i < hotspots; i++) {
    const localTime = staggerTime(time, i)
    const angle = (i / hotspots) * Math.PI * 2 + localTime / (2000 / variant.speedMultiplier)
    const radius = 70 + Math.sin(localTime / 800 + i) * (30 + variant.intensity * 25)
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius * 0.8

    ctx.fillStyle = withAlpha(colors.secondary, 0.9)
    ctx.fillText("✦", x, y)
  }
}

function drawGalaxy(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
  variant: StyleVariant,
) {
  const centerX = width / 2
  const centerY = height / 2
  const chars = ["∗", "·", "×", "+", "✦", "✧"]

  ctx.font = `${12 + variant.intensity * 3}px monospace`

  // Spiral arms
  const numArms = Math.max(2, Math.floor(3 + variant.densityMultiplier))
  const armExtent = 160 + variant.densityMultiplier * 80

  for (let arm = 0; arm < numArms; arm++) {
    const armAngle = (arm / numArms) * Math.PI * 2

    for (let i = 0; i < 110; i++) {
      const pct = i / 35
      const localTime = staggerTime(time, i + arm * 10)
      const angle = armAngle + pct * Math.PI * 2 + (localTime / (1600 / variant.speedMultiplier))
      const radius = pct * armExtent
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius * 0.65

      const char = chars[(i + arm) % chars.length]
      const brightness = 1 - i / 150
      const paletteIndex = (arm + i) % 3

      ctx.fillStyle = withAlpha(
        [colors.primary, colors.secondary, colors.accent][paletteIndex],
        0.2 + Math.max(0, brightness) * 0.6,
      )
      ctx.fillText(char, x, y)
    }
  }

  // Galactic bulge
  ctx.font = `${16 + variant.intensity * 4}px monospace`
  const bulgeStars = Math.floor(35 + variant.densityMultiplier * 20)
  for (let i = 0; i < bulgeStars; i++) {
    const localTime = staggerTime(time, i)
    const angle = (i / bulgeStars) * Math.PI * 2 + (localTime / (1600 / variant.speedMultiplier)) * 1.8
    const radius = 18 + Math.sin(localTime / (400 / variant.speedMultiplier) + i) * (8 + variant.intensity * 6)
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius

    ctx.fillStyle = colors.secondary
    ctx.fillText("●", x, y)
  }

  // Central supermassive black hole
  ctx.font = `${22 + variant.intensity * 4}px monospace`
  ctx.fillStyle = colors.primary
  ctx.fillText("◉", centerX - 12, centerY + 8)
}

function drawStarCluster(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
  variant: StyleVariant,
) {
  const centerX = width / 2
  const centerY = height / 2
  const chars = ["★", "✦", "✧", "✶", "⋆"]

  const clusterStars = Math.floor(90 * variant.densityMultiplier)
  const jitter = 40 + variant.distortion * 60

  // Clustered stars with varying brightness
  for (let i = 0; i < clusterStars; i++) {
    const localTime = staggerTime(time, i)
    const angle = (i / clusterStars) * Math.PI * 2
    const radius = 25 + Math.random() * (100 + variant.densityMultiplier * 60)
    const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * jitter
    const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * jitter

    const twinkle = Math.sin(localTime / (260 / variant.speedMultiplier) + i + variant.oscillationPhase) * 0.5 + 0.5
    const char = chars[i % chars.length]
    const size = 10 + Math.random() * (14 + variant.intensity * 6)

    ctx.font = `${size}px monospace`
    ctx.fillStyle = withAlpha(
      [colors.primary, colors.secondary, colors.accent][i % 3],
      0.3 + twinkle * 0.6,
    )
    ctx.fillText(char, x, y)
  }
}

function drawQuasar(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
  variant: StyleVariant,
) {
  const centerX = width / 2
  const centerY = height / 2

  // Intense core
  const pulse = Math.sin(time / (190 / variant.speedMultiplier) + variant.oscillationPhase) * 0.3 + 0.7
  ctx.font = `${28 + variant.intensity * 6}px monospace`
  ctx.fillStyle = colors.primary
  ctx.fillText("◉", centerX - 16, centerY + 12)

  // Relativistic jets
  ctx.font = `${18 + variant.intensity * 4}px monospace`
  const jetChars = ["║", "│", "┃", "▌", "▐"]
  const jetReach = 220 + variant.densityMultiplier * 120

  for (let dir = -1; dir <= 1; dir += 2) {
    for (let dist = 40; dist < jetReach; dist += 18) {
      const x = centerX
      const y = centerY + dir * dist
      const intensity = 1 - dist / jetReach

      ctx.fillStyle = withAlpha(colors.secondary, Math.max(0.25, intensity * pulse))
      ctx.fillText(jetChars[Math.floor(dist / 20) % jetChars.length], x, y)
    }
  }

  // Accretion disk
  ctx.font = `${14 + variant.intensity * 3}px monospace`
  const rings = Math.floor(4 + variant.densityMultiplier * 4)
  for (let ring = 1; ring <= rings; ring++) {
    const radius = 45 + ring * (18 + variant.distortion * 12)
    const numChars = Math.floor(radius / 4)

    for (let i = 0; i < numChars; i++) {
      const localTime = staggerTime(time, i + ring * 10)
      const angle = (i / numChars) * Math.PI * 2 + localTime / (500 / variant.speedMultiplier)
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius * 0.3

      const alpha = Math.max(0.2, 1 - ring / (rings + 1))
      ctx.fillStyle = withAlpha(colors.accent, alpha)
      ctx.fillText("·", x, y)
    }
  }
}

function drawSupernovaRemnant(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
  variant: StyleVariant,
) {
  const centerX = width / 2
  const centerY = height / 2
  const chars = ["░", "▒", "▓", "█", "✦", "✧"]

  // Expanding shock wave
  const expansion = (time / (45 / variant.speedMultiplier)) % (180 + variant.intensity * 80)
  ctx.font = `${16 + variant.intensity * 4}px monospace`

  const shockPoints = Math.floor(80 * variant.densityMultiplier)
  for (let i = 0; i < shockPoints; i++) {
    const localTime = staggerTime(time, i)
    const angle = (i / 100) * Math.PI * 2
    const radius = 70 + expansion + Math.sin(localTime / (480 / variant.speedMultiplier) + i) * (25 + variant.intensity * 15)
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius

    const char = chars[i % chars.length]
    ctx.fillStyle = [colors.primary, colors.secondary, colors.accent][i % 3]
    ctx.fillText(char, x, y)
  }

  // Filamentary structure
  ctx.font = `${12 + variant.intensity * 2}px monospace`
  const filamentPoints = Math.floor(160 * variant.densityMultiplier)
  for (let i = 0; i < filamentPoints; i++) {
    const angle = (i / 200) * Math.PI * 2
    const radius = 50 + Math.random() * (140 + variant.densityMultiplier * 80)
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius

    ctx.fillStyle = withAlpha(colors.secondary, 0.5)
    ctx.fillText("·", x, y)
  }

  // Central neutron star
  ctx.font = `${22 + variant.intensity * 4}px monospace`
  const pulse = Math.sin(time / (320 / variant.speedMultiplier)) * 0.5 + 0.5
  ctx.fillStyle = withAlpha(colors.primary, 0.3 + pulse * 0.6)
  ctx.fillText("⊙", centerX - 12, centerY + 8)
}

function drawExoplanet(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
  variant: StyleVariant,
) {
  const centerX = width / 2
  const centerY = height / 2

  // Planet body
  ctx.font = `${22 + variant.intensity * 4}px monospace`
  const planetChars = ["●", "◉", "⊙"]
  const gridSize = 6

  for (let dy = -gridSize; dy <= gridSize; dy++) {
    for (let dx = -gridSize; dx <= gridSize; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist <= gridSize) {
        const x = centerX + dx * 12
        const y = centerY + dy * 12
        const char = planetChars[Math.floor(dist) % planetChars.length]

        const gradient = dist / gridSize
        ctx.fillStyle = gradient < 0.5 ? colors.primary : colors.secondary
        ctx.fillText(char, x, y)
      }
    }
  }

  // Atmosphere
  ctx.font = `${14 + variant.intensity * 3}px monospace`
  const atmospherePoints = Math.floor(70 + variant.densityMultiplier * 30)
  for (let i = 0; i < atmospherePoints; i++) {
    const localTime = staggerTime(time, i)
    const angle = (i / atmospherePoints) * Math.PI * 2 + localTime / (2100 / variant.speedMultiplier)
    const radius = 90 + Math.sin(localTime / (480 / variant.speedMultiplier) + i) * (10 + variant.distortion * 12)
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius

    ctx.fillStyle = withAlpha(colors.accent, 0.35)
    ctx.fillText("·", x, y)
  }

  // Orbiting moon
  const moonAngle = time / (900 / variant.speedMultiplier)
  const orbitRadius = 140 + variant.densityMultiplier * 40
  const moonX = centerX + Math.cos(moonAngle) * orbitRadius
  const moonY = centerY + Math.sin(moonAngle) * orbitRadius

  ctx.font = `${12 + variant.intensity * 3}px monospace`
  ctx.fillStyle = colors.secondary
  ctx.fillText("○", moonX, moonY)
}

function drawPlanetaryRings(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
  variant: StyleVariant,
) {
  const centerX = width / 2
  const centerY = height / 2

  // Planet
  ctx.font = `${26 + variant.intensity * 4}px monospace`
  const gridSize = 5

  for (let dy = -gridSize; dy <= gridSize; dy++) {
    for (let dx = -gridSize; dx <= gridSize; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist <= gridSize) {
        const x = centerX + dx * 14
        const y = centerY + dy * 14

        ctx.fillStyle = colors.primary
        ctx.fillText("●", x, y)
      }
    }
  }

  // Ring system
  ctx.font = `${12 + variant.intensity * 3}px monospace`
  const ringChars = ["─", "═", "▬"]

  const ringCount = Math.floor(4 + variant.densityMultiplier * 3)

  for (let ring = 1; ring <= ringCount; ring++) {
    const innerRadius = 90 + ring * (18 + variant.distortion * 12)
    const outerRadius = innerRadius + (10 + variant.intensity * 8)
    const numParticles = Math.floor(innerRadius / 2.5)

    for (let i = 0; i < numParticles; i++) {
      const localTime = staggerTime(time, i + ring * 10)
      const angle = (i / numParticles) * Math.PI * 2 + localTime / (2100 / variant.speedMultiplier)
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius)
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius * 0.3

      const char = ringChars[ring % ringChars.length]
      const colorIndex = ring % 3

      const alpha = 0.35 + variant.intensity * 0.4
      ctx.fillStyle = withAlpha([colors.primary, colors.secondary, colors.accent][colorIndex], alpha)
      ctx.fillText(char, x, y)
    }
  }
}

function drawEnhancedASCIIOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: Date,
  weather: WeatherData | null,
  entity: CosmicEntity,
  variant: StyleVariant,
) {
  // Entity name label with decorative border
  ctx.font = "bold 18px monospace"
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
  ctx.strokeStyle = "rgba(0, 0, 0, 0.9)"
  ctx.lineWidth = 4
  ctx.textAlign = "center"

  const labelText = `╔═══ [ ${entity.name} ] ═══╗`
  ctx.strokeText(labelText, width / 2, height - 80)
  ctx.fillText(labelText, width / 2, height - 80)

  // Time display
  const hours = time.getHours().toString().padStart(2, "0")
  const minutes = time.getMinutes().toString().padStart(2, "0")
  const seconds = time.getSeconds().toString().padStart(2, "0")
  const timeString = `${hours}:${minutes}:${seconds} IST`

  ctx.font = "bold 22px monospace"
  ctx.strokeText(timeString, width / 2, 45)
  ctx.fillText(timeString, width / 2, 45)

  // Weather info
  if (weather) {
    const weatherText = getWeatherText(weather.weatherCode)
    const tempText = `${weather.temperature}°C`
    const weatherString = `${weatherText} · ${tempText}`

    ctx.font = "16px monospace"
    ctx.strokeText(weatherString, width / 2, height - 50)
    ctx.fillText(weatherString, width / 2, height - 50)
  }

  // Entity type and animation style
  ctx.font = "12px monospace"
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
  ctx.textAlign = "left"
  ctx.fillText(
    `TYPE: ${entity.type.toUpperCase()} | STYLE: ${entity.animationStyle.toUpperCase()} → ${variant.baseStyle.toUpperCase()}`,
    20,
    height - 20,
  )

  // Location
  ctx.textAlign = "right"
  ctx.fillText("KOLKATA, INDIA", width - 20, height - 20)
}

function getWeatherText(weatherCode: number): string {
  if (weatherCode === 0) return "CLEAR"
  if (weatherCode >= 1 && weatherCode <= 3) return "CLOUDY"
  if (weatherCode >= 45 && weatherCode <= 48) return "FOGGY"
  if (weatherCode >= 51 && weatherCode <= 67) return "RAINY"
  if (weatherCode >= 71 && weatherCode <= 77) return "SNOWY"
  if (weatherCode >= 80 && weatherCode <= 99) return "STORMY"
  return "UNKNOWN"
}

function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex)
  const clamped = Math.min(1, Math.max(0, alpha))
  return `rgba(${r}, ${g}, ${b}, ${clamped})`
}

function applyEnhancedDithering(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: { primary: string; secondary: string; accent: string },
) {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  const ditherMatrix = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ]

  const tint = hexToRgb(colors.secondary)
  const accent = hexToRgb(colors.accent)

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4
      const threshold = (ditherMatrix[y % 4][x % 4] / 16) * 255

      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114

      if (gray > threshold) {
        // Bright pixels get color tint
        const tintStrength = gray / 255
        data[i] = Math.min(255, data[i] * 0.7 + tint.r * 0.2 + accent.r * 0.1 * tintStrength)
        data[i + 1] = Math.min(255, data[i + 1] * 0.7 + tint.g * 0.2 + accent.g * 0.1 * tintStrength)
        data[i + 2] = Math.min(255, data[i + 2] * 0.7 + tint.b * 0.2 + accent.b * 0.1 * tintStrength)
      } else {
        // Dark pixels
        data[i] = data[i] * 0.15
        data[i + 1] = data[i + 1] * 0.15
        data[i + 2] = data[i + 2] * 0.15
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}
