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
      canvas.width = Math.min(window.innerWidth / 2, 1920)
      canvas.height = Math.min(window.innerHeight, 1080)
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
      const time = Date.now()

      // Clear canvas
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, width, height)

      if (isTransitioning && !isInteractiveMode) {
        const currentEntity = COSMIC_ENTITIES[currentEntityIndex]
        const nextEntity = COSMIC_ENTITIES[nextEntityIndex]

        // Render current scene
        ctx.globalAlpha = 1 - transitionProgress
        renderEntity(ctx, width, height, time, currentEntity, particlesRef.current)

        // Render next scene
        ctx.globalAlpha = transitionProgress
        renderEntity(ctx, width, height, time, nextEntity, particlesRef.current)

        ctx.globalAlpha = 1
      } else {
        renderEntity(ctx, width, height, time, entity, particlesRef.current)
      }

      drawEnhancedASCIIOverlay(ctx, width, height, currentTime, weather, entity)

      applyEnhancedDithering(ctx, width, height, entity.colorPalette)

      animationRef.current = requestAnimationFrame(render)
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
  ])

  return <canvas ref={canvasRef} className="w-full h-full" />
}

function renderEntity(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  entity: CosmicEntity,
  particles: any[],
) {
  // Draw background star field
  drawStarField(ctx, width, height, time, entity.colorPalette)

  // Update and draw particles
  updateParticles(particles, width, height, entity.colorPalette)
  drawParticles(ctx, particles)

  // Render entity based on type
  switch (entity.type) {
    case "meteoroid":
    case "comet":
      drawMeteoroidField(ctx, width, height, time, entity.colorPalette, entity.animationStyle)
      break
    case "blackhole":
      drawBlackHole(ctx, width, height, time, entity.colorPalette, entity.animationStyle)
      break
    case "sun":
    case "star":
      drawStar(ctx, width, height, time, entity.colorPalette, entity.animationStyle, entity.type === "sun")
      break
    case "pulsar":
      drawPulsar(ctx, width, height, time, entity.colorPalette)
      break
    case "nebula":
      drawNebula(ctx, width, height, time, entity.colorPalette, entity.animationStyle)
      break
    case "galaxy":
      drawGalaxy(ctx, width, height, time, entity.colorPalette, entity.animationStyle)
      break
    case "cluster":
      drawStarCluster(ctx, width, height, time, entity.colorPalette)
      break
    case "quasar":
      drawQuasar(ctx, width, height, time, entity.colorPalette)
      break
    case "supernova":
      drawSupernovaRemnant(ctx, width, height, time, entity.colorPalette)
      break
    case "exoplanet":
      drawExoplanet(ctx, width, height, time, entity.colorPalette)
      break
    case "rings":
      drawPlanetaryRings(ctx, width, height, time, entity.colorPalette)
      break
  }
}

function createParticle(width: number, height: number): any {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    life: Math.random() * 100,
    maxLife: 100,
    char: ["·", "∙", "•", "○"][Math.floor(Math.random() * 4)],
    color: "#FFFFFF",
  }
}

function updateParticles(particles: any[], width: number, height: number, colors: any) {
  particles.forEach((p) => {
    p.x += p.vx
    p.y += p.vy
    p.life -= 0.5

    if (p.life <= 0 || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
      p.x = Math.random() * width
      p.y = Math.random() * height
      p.life = p.maxLife
      p.color = [colors.primary, colors.secondary, colors.accent][Math.floor(Math.random() * 3)]
    }
  })
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: any[]) {
  ctx.font = "12px monospace"
  particles.forEach((p) => {
    const alpha = p.life / p.maxLife
    ctx.fillStyle =
      p.color +
      Math.floor(alpha * 255)
        .toString(16)
        .padStart(2, "0")
    ctx.fillText(p.char, p.x, p.y)
  })
}

function drawStarField(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, colors: any) {
  ctx.font = "10px monospace"
  for (let i = 0; i < 300; i++) {
    const x = (i * 137.5) % width
    const y = (i * 73.3) % height
    const twinkle = Math.sin(time / 1000 + i) * 0.5 + 0.5
    ctx.fillStyle =
      colors.accent +
      Math.floor(twinkle * 100)
        .toString(16)
        .padStart(2, "0")
    ctx.fillText("·", x, y)
  }
}

function drawMeteoroidField(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
  animationStyle: string,
) {
  const chars = ["·", "°", "*", "∙", "○", "●"]
  ctx.font = "16px monospace"

  for (let i = 0; i < 200; i++) {
    const speed = animationStyle === "drift" ? 25 : 20
    const x = ((i * 137.5 + time / speed) % (width + 100)) - 50
    const y = ((i * 73.3 + time / (speed - 5)) % (height + 100)) - 50
    const brightness = Math.sin(time / 500 + i) * 0.5 + 0.5
    const char = chars[i % chars.length]

    ctx.fillStyle = brightness > 0.5 ? colors.secondary : colors.primary
    ctx.fillText(char, x, y)
  }
}

function drawBlackHole(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
  animationStyle: string,
) {
  const centerX = width / 2
  const centerY = height / 2
  const chars = ["○", "●", "◉", "◎", "⊙", "⊚"]

  ctx.font = "20px monospace"

  // Event horizon
  ctx.fillStyle = colors.primary
  ctx.beginPath()
  ctx.arc(centerX, centerY, 50, 0, Math.PI * 2)
  ctx.fill()

  // Swirling accretion disk
  const rotation = animationStyle === "swirl" ? time / 800 : time / 1000
  for (let ring = 1; ring <= 12; ring++) {
    const radius = 60 + ring * 25
    const numChars = Math.floor(radius / 6)
    const ringRotation = rotation * (ring % 2 === 0 ? 1 : -1)

    for (let i = 0; i < numChars; i++) {
      const angle = (i / numChars) * Math.PI * 2 + ringRotation
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      const char = chars[ring % chars.length]

      const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
      const intensity = 1 - distanceFromCenter / (width / 2)

      ctx.fillStyle = intensity > 0.6 ? colors.secondary : intensity > 0.3 ? colors.accent : colors.primary
      ctx.fillText(char, x, y)
    }
  }

  // Gravitational lensing effect
  const pulse = Math.sin(time / 400) * 0.3 + 0.7
  ctx.fillStyle =
    colors.secondary +
    Math.floor(pulse * 150)
      .toString(16)
      .padStart(2, "0")
  ctx.font = "28px monospace"
  ctx.fillText("◉", centerX - 14, centerY + 10)
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
  animationStyle: string,
  isSun: boolean,
) {
  const centerX = width / 2
  const centerY = height / 2
  const baseRadius = isSun ? 90 : 70

  // Corona/flares
  ctx.font = "18px monospace"
  const flareChars = ["╱", "╲", "│", "─", "╳", "✦", "✧", "✶"]
  const numFlares = isSun ? 24 : 16

  for (let i = 0; i < numFlares; i++) {
    const angle = (i / numFlares) * Math.PI * 2 + time / 1000
    const pulse = animationStyle === "pulse" ? Math.sin(time / 300 + i) * 30 : Math.sin(time / 400 + i) * 20
    const flareLength = 70 + pulse
    const x = centerX + Math.cos(angle) * (baseRadius + flareLength)
    const y = centerY + Math.sin(angle) * (baseRadius + flareLength)
    const char = flareChars[i % flareChars.length]

    const colorIndex = i % 3
    ctx.fillStyle = [colors.primary, colors.secondary, colors.accent][colorIndex]
    ctx.fillText(char, x, y)
  }

  // Star core with layered detail
  ctx.font = "22px monospace"
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

        ctx.fillStyle = brightness > 0.7 ? colors.primary : brightness > 0.4 ? colors.secondary : colors.accent
        ctx.fillText(char, x, y)
      }
    }
  }

  // Twinkle effect for stars
  if (animationStyle === "twinkle") {
    ctx.font = "30px monospace"
    const twinkle = Math.sin(time / 200) * 0.5 + 0.5
    ctx.fillStyle =
      colors.secondary +
      Math.floor(twinkle * 255)
        .toString(16)
        .padStart(2, "0")
    ctx.fillText("✦", centerX - 15, centerY + 10)
  }
}

function drawPulsar(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
) {
  const centerX = width / 2
  const centerY = height / 2
  const pulse = Math.sin(time / 200) * 0.5 + 0.5

  // Pulsating core
  ctx.font = "24px monospace"
  ctx.fillStyle = colors.primary
  ctx.fillText("⊙", centerX - 12, centerY + 8)

  // Radiation beams
  ctx.font = "16px monospace"
  const beamChars = ["│", "║", "┃"]
  const rotation = time / 500

  for (let i = 0; i < 2; i++) {
    const angle = rotation + i * Math.PI
    for (let dist = 30; dist < 200; dist += 15) {
      const x = centerX + Math.cos(angle) * dist
      const y = centerY + Math.sin(angle) * dist
      const intensity = 1 - dist / 200

      ctx.fillStyle =
        colors.secondary +
        Math.floor(intensity * pulse * 255)
          .toString(16)
          .padStart(2, "0")
      ctx.fillText(beamChars[Math.floor(dist / 15) % beamChars.length], x, y)
    }
  }

  // Magnetic field lines
  ctx.font = "12px monospace"
  for (let ring = 1; ring <= 5; ring++) {
    const radius = 40 + ring * 20
    const numPoints = Math.floor(radius / 5)

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      ctx.fillStyle = colors.accent + "80"
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
  animationStyle: string,
) {
  const centerX = width / 2
  const centerY = height / 2
  const chars = ["░", "▒", "▓", "█", "▪", "▫"]

  ctx.font = "20px monospace"

  // Nebula cloud structure
  for (let i = 0; i < 500; i++) {
    const angle = (i / 500) * Math.PI * 2
    const radius = 50 + Math.random() * 150
    const wave = animationStyle === "wave" ? Math.sin(time / 1000 + i / 10) * 30 : 0
    const drift = animationStyle === "drift" ? (time / 50) % 100 : 0

    const x = centerX + Math.cos(angle) * radius + wave + drift
    const y = centerY + Math.sin(angle) * radius * 0.7 + Math.sin(time / 1000 + i / 20) * 20

    const density = Math.random()
    const char = chars[Math.floor(density * chars.length)]
    const colorIndex = Math.floor(density * 3)

    ctx.fillStyle =
      [colors.primary, colors.secondary, colors.accent][colorIndex] +
      Math.floor(density * 200)
        .toString(16)
        .padStart(2, "0")
    ctx.fillText(char, x, y)
  }

  // Bright emission regions
  ctx.font = "24px monospace"
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2 + time / 2000
    const radius = 80 + Math.sin(time / 1000 + i) * 40
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius * 0.7

    ctx.fillStyle = colors.secondary
    ctx.fillText("✦", x, y)
  }
}

function drawGalaxy(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
  animationStyle: string,
) {
  const centerX = width / 2
  const centerY = height / 2
  const chars = ["∗", "·", "×", "+", "✦", "✧"]

  ctx.font = "14px monospace"

  // Spiral arms
  const rotation = animationStyle === "swirl" ? time / 1500 : time / 2000
  const numArms = 4

  for (let arm = 0; arm < numArms; arm++) {
    const armAngle = (arm / numArms) * Math.PI * 2

    for (let i = 0; i < 120; i++) {
      const t = i / 30
      const angle = armAngle + t * Math.PI * 2 + rotation
      const radius = t * 180
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius * 0.6

      if (x >= 0 && x < width && y >= 0 && y < height) {
        const char = chars[i % chars.length]
        const colorIndex = Math.floor((i / 120) * 3)
        const brightness = 1 - i / 120

        ctx.fillStyle =
          [colors.primary, colors.secondary, colors.accent][colorIndex] +
          Math.floor(brightness * 200)
            .toString(16)
            .padStart(2, "0")
        ctx.fillText(char, x, y)
      }
    }
  }

  // Galactic bulge
  ctx.font = "18px monospace"
  for (let i = 0; i < 40; i++) {
    const angle = (i / 40) * Math.PI * 2 + rotation * 2
    const radius = 20 + Math.sin(time / 500 + i) * 10
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius

    ctx.fillStyle = colors.secondary
    ctx.fillText("●", x, y)
  }

  // Central supermassive black hole
  ctx.font = "24px monospace"
  ctx.fillStyle = colors.primary
  ctx.fillText("◉", centerX - 12, centerY + 8)
}

function drawStarCluster(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
) {
  const centerX = width / 2
  const centerY = height / 2
  const chars = ["★", "✦", "✧", "✶", "⋆"]

  ctx.font = "16px monospace"

  // Clustered stars with varying brightness
  for (let i = 0; i < 150; i++) {
    const angle = (i / 150) * Math.PI * 2
    const radius = 30 + Math.random() * 120
    const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 40
    const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 40

    const twinkle = Math.sin(time / 300 + i) * 0.5 + 0.5
    const char = chars[i % chars.length]
    const size = 12 + Math.random() * 12

    ctx.font = `${size}px monospace`
    ctx.fillStyle =
      [colors.primary, colors.secondary, colors.accent][i % 3] +
      Math.floor(twinkle * 255)
        .toString(16)
        .padStart(2, "0")
    ctx.fillText(char, x, y)
  }
}

function drawQuasar(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
) {
  const centerX = width / 2
  const centerY = height / 2

  // Intense core
  const pulse = Math.sin(time / 200) * 0.3 + 0.7
  ctx.font = "32px monospace"
  ctx.fillStyle = colors.primary
  ctx.fillText("◉", centerX - 16, centerY + 12)

  // Relativistic jets
  ctx.font = "20px monospace"
  const jetChars = ["║", "│", "┃", "▌", "▐"]

  for (let dir = -1; dir <= 1; dir += 2) {
    for (let dist = 40; dist < 250; dist += 20) {
      const x = centerX
      const y = centerY + dir * dist
      const intensity = 1 - dist / 250

      ctx.fillStyle =
        colors.secondary +
        Math.floor(intensity * pulse * 255)
          .toString(16)
          .padStart(2, "0")
      ctx.fillText(jetChars[Math.floor(dist / 20) % jetChars.length], x, y)
    }
  }

  // Accretion disk
  ctx.font = "16px monospace"
  for (let ring = 1; ring <= 6; ring++) {
    const radius = 50 + ring * 20
    const numChars = Math.floor(radius / 5)

    for (let i = 0; i < numChars; i++) {
      const angle = (i / numChars) * Math.PI * 2 + time / 500
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius * 0.3

      ctx.fillStyle = colors.accent
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
) {
  const centerX = width / 2
  const centerY = height / 2
  const chars = ["░", "▒", "▓", "█", "✦", "✧"]

  // Expanding shock wave
  const expansion = (time / 50) % 200
  ctx.font = "18px monospace"

  for (let i = 0; i < 100; i++) {
    const angle = (i / 100) * Math.PI * 2
    const radius = 80 + expansion + Math.sin(time / 500 + i) * 30
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius

    const char = chars[i % chars.length]
    ctx.fillStyle = [colors.primary, colors.secondary, colors.accent][i % 3]
    ctx.fillText(char, x, y)
  }

  // Filamentary structure
  ctx.font = "14px monospace"
  for (let i = 0; i < 200; i++) {
    const angle = (i / 200) * Math.PI * 2
    const radius = 50 + Math.random() * 150
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius

    ctx.fillStyle = colors.secondary + "80"
    ctx.fillText("·", x, y)
  }

  // Central neutron star
  ctx.font = "24px monospace"
  const pulse = Math.sin(time / 300) * 0.5 + 0.5
  ctx.fillStyle =
    colors.primary +
    Math.floor(pulse * 255)
      .toString(16)
      .padStart(2, "0")
  ctx.fillText("⊙", centerX - 12, centerY + 8)
}

function drawExoplanet(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
) {
  const centerX = width / 2
  const centerY = height / 2

  // Planet body
  ctx.font = "24px monospace"
  const planetChars = ["●", "◉", "⊙"]
  const gridSize = 6

  for (let dy = -gridSize; dy <= gridSize; dy++) {
    for (let dx = -gridSize; dx <= gridSize; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist <= gridSize) {
        const x = centerX + dx * 12
        const y = centerY + dy * 12
        const char = planetChars[Math.floor(dist) % planetChars.length]

        ctx.fillStyle = dist < gridSize / 2 ? colors.primary : colors.secondary
        ctx.fillText(char, x, y)
      }
    }
  }

  // Atmosphere
  ctx.font = "16px monospace"
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2 + time / 2000
    const radius = 90 + Math.sin(time / 500 + i) * 10
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius

    ctx.fillStyle = colors.accent + "60"
    ctx.fillText("·", x, y)
  }

  // Orbiting moon
  const moonAngle = time / 1000
  const moonX = centerX + Math.cos(moonAngle) * 150
  const moonY = centerY + Math.sin(moonAngle) * 150

  ctx.font = "16px monospace"
  ctx.fillStyle = colors.secondary
  ctx.fillText("○", moonX, moonY)
}

function drawPlanetaryRings(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
) {
  const centerX = width / 2
  const centerY = height / 2

  // Planet
  ctx.font = "28px monospace"
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
  ctx.font = "14px monospace"
  const ringChars = ["─", "═", "▬"]

  for (let ring = 1; ring <= 5; ring++) {
    const innerRadius = 100 + ring * 20
    const outerRadius = innerRadius + 15
    const numParticles = Math.floor(innerRadius / 3)

    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * Math.PI * 2 + time / 2000
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius)
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius * 0.3

      const char = ringChars[ring % ringChars.length]
      const colorIndex = ring % 3

      ctx.fillStyle = [colors.primary, colors.secondary, colors.accent][colorIndex] + "C0"
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
  ctx.fillText(`TYPE: ${entity.type.toUpperCase()} | STYLE: ${entity.animationStyle.toUpperCase()}`, 20, height - 20)

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
