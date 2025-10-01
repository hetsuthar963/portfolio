"use client";

import { useState, type CSSProperties } from "react"
import dynamic from "next/dynamic"
import cosmicEntities from "@/data/cosmic-entities.json"

const CosmicWidget = dynamic(
  () => import("@/components/cosmic-ascii-scene").then((mod) => mod.CosmicASCIIScene),
  {
    ssr: false,
    loading: () => (
      <div className="cosmic-widget" aria-hidden>
        <span className="text-xs text-slate-500">Calibrating starmap…</span>
      </div>
    ),
  },
)

export default function ResumePage() {
  const [isInteractiveMode, setIsInteractiveMode] = useState(false)
  const [manualScene, setManualScene] = useState(0)

  const totalEntities = cosmicEntities.entities.length

  return (
    <main className="cosmic-screen font-mono" aria-label="Het Suthar Resume">
      <div className="mx-auto flex min-h-screen flex-col gap-8 px-4 pb-16 pt-8 lg:max-w-[1600px] lg:px-10 lg:pt-16">
        <section className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12" aria-label="Cosmic showcase">
          <div className="space-y-6 lg:flex-[0_0_26rem] lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto lg:pr-4" aria-label="Resume content">
            <header className="space-y-1">
  {/* <h1 className="text-base text-cyan-400 tracking-[0.4em] uppercase">cosmic.cv</h1> */}
  <h1 className="mt-2 text-3xl text-purple-300">Het Suthar</h1>
  <p className="text-sm text-slate-400">Full Stack + AI Developer · DevOps Enthusiast </p>
</header>

<section className="cosmic-section" aria-label="Education">
  <h2 className="cosmic-heading">Education</h2>
  <ul className="cosmic-list">
    <li>
      <strong>B.E. in Information Technology</strong><br />
      Sardar Vallabhbhai Patel Institute of Technology, Gujarat<br />
      <span className="text-slate-400">July 2022 – Present · CGPA: 7.50</span>
    </li>
  </ul>
</section>

<section className="cosmic-section" aria-label="Skills">
  <h2 className="cosmic-heading">Skills</h2>
  <ul className="cosmic-list">
    <li><strong>Languages:</strong> Java (Inter.), Python (Inter.), JavaScript (Prof.), TypeScript (Begin.)</li>
    <li><strong>Frameworks/Libraries:</strong> Next.js, React, Express, Tailwind CSS, Prisma/Drizzle ORM, Zod, MonoRepo</li>
    <li><strong>Databases:</strong> MySQL, MongoDB, PostgreSQL</li>
    <li><strong>Tools:</strong> GitHub, Git, Postman, Cloudflare</li>
    <li><strong>Cloud/DevOps:</strong> AWS (EC2, S3, Route 53, Elastic IP), Docker</li>
  </ul>
</section>

<section className="cosmic-section" aria-label="Projects">
  <h2 className="cosmic-heading">Projects</h2>
  <ul className="cosmic-list">
    <li>
      <strong>RAG Project – Talk to Your Data</strong> — Built a GenAI app that lets users chat with PDFs and extract repeated questions using Gemini + Pinecone RAG. Integrated Clerk for auth, AWS S3 for secure file storage, and Drizzle ORM with Neon for chat persistence. Full-stack: Next.js, TypeScript, TailwindCSS.
    </li>
    <li>
      <strong>LLM-Powered Job Scraper</strong> — Chrome extension using JavaScript to scrape LinkedIn jobs, send to Node.js + Express backend. REST APIs store data in MongoDB and summarize content using OpenAI/Gemini. React + Vite dashboard deployed on AWS EC2 with Nginx.
    </li>
    <li>
      <strong>OnBlogs</strong> — Blogging platform built with React, Cloudflare Workers, PostgreSQL, Prisma ORM, and JWT. Ensures type-safe, secure, scalable blogging experience.
    </li>
  </ul>
</section>

<section className="cosmic-section" aria-label="Honors and Certificates">
  <h2 className="cosmic-heading">Honors & Certificates</h2>
  <ul className="cosmic-list">
    <li>Government-Recognized SSIP Grant (AI document fraud detection) — leading 3-member team to build MVP</li>
    <li>HackBangalore Finalist — Participated in AngleHacks Global Hackathon series</li>
    <li>Ranked 9th — Departmental Mock Placement Round (SVIT IT)</li>
  </ul>
</section>

            <nav className="cosmic-section" aria-label="Primary Links">
              <h2 className="cosmic-heading">Links</h2>
              <div className="cosmic-links">
                <a href="https://x.com/HetSuthar3369" aria-label="Open Twitter profile">Twitter</a>
                <a href="mailto:hetsuthar31@gmail.com" aria-label="Send email to Het">Email</a>
                <a href="https://github.com/hetsuthar963" aria-label="Open GitHub profile">GitHub</a>
                <a href="https://www.linkedin.com/in/het-suthar-00690a208/" aria-label="Open LinkedIn profile">
                  LinkedIn
                </a>
              </div>
            </nav>
          </div>

          <div className="flex flex-col gap-5 lg:flex-1" aria-label="Cosmic display">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <header className="space-y-1">
                <h2 className="text-sm font-semibold uppercase tracking-[0.4em] text-cyan-400">Cosmic Widget</h2>
                <p className="text-xs text-slate-400">Auto-mode cycles through {totalEntities} scenes</p>
              </header>

              <div className="flex items-center gap-2 self-start sm:self-auto" aria-label="Cosmic display controls">
                <button
                  onClick={() => setIsInteractiveMode(!isInteractiveMode)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    isInteractiveMode ? "bg-purple-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                  aria-label="Toggle cosmic widget mode"
                >
                  {isInteractiveMode ? "Interactive" : "Auto"}
                </button>
                {isInteractiveMode && (
                  <div className="flex gap-2" aria-label="Scene navigation">
                    <button
                      onClick={() => setManualScene((prev) => (prev - 1 + totalEntities) % totalEntities)}
                      className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
                      aria-label="Previous cosmic scene"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setManualScene((prev) => (prev + 1) % totalEntities)}
                      className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
                      aria-label="Next cosmic scene"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isInteractiveMode && (
              <div className="text-xs text-slate-400 lg:text-sm" aria-live="polite">
                Scene {manualScene + 1} of {totalEntities}
              </div>
            )}

            <div
              className="cosmic-widget animation-container perf-optimize"
              style={{ "--accent": "#00E5FF" } as CSSProperties}
            >
              <pre className="lg:text-[16px] lg:w-full gpu-accelerate">
                <CosmicWidget isInteractiveMode={isInteractiveMode} manualScene={manualScene} />
              </pre>
              
            </div>
            <footer className="w-full bg-gray-900 py-4">
              <p className="text-xs text-gray-400 text-center px-4 leading-relaxed font-mono">
                © 2025 Het Suthar. Cosmic Widget is proprietary to Het Suthar. Usage, distribution, or modification requires explicit credit and compliance with the license terms outlined in the repository.
              </p>
          </footer>
          </div>
          
        </section>
      </div>
    </main>
  )
}
