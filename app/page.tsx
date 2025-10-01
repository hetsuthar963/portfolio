"use client";

import { useState } from "react"
import { CosmicASCIIScene } from "@/components/cosmic-ascii-scene"

export default function ResumePage() {
  const [isInteractiveMode, setIsInteractiveMode] = useState(false)
  const [manualScene, setManualScene] = useState(0)

  const totalEntities = 30

  const sceneNames = ["METEOROID", "BLACK HOLE", "SUN", "STAR", "GALAXY"]

  return (
    <div className="relative min-h-screen overflow-hidden flex bg-black">
      {/* Left Panel - Resume Content */}
      <div className="w-1/2 p-8 font-mono relative z-10 bg-black text-white border-r border-white/10">
        <div className="absolute top-8 right-8 flex items-center gap-4">
          <button
            onClick={() => setIsInteractiveMode(!isInteractiveMode)}
            className={`px-3 py-1 text-sm rounded font-mono transition-colors ${
              isInteractiveMode ? "bg-purple-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {isInteractiveMode ? "INTERACTIVE" : "AUTO"}
          </button>

          {isInteractiveMode && (
            <div className="flex gap-2">
              <button
                onClick={() => setManualScene((prev) => (prev - 1 + totalEntities) % totalEntities)}
                className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Previous scene"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={() => setManualScene((prev) => (prev + 1) % totalEntities)}
                className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Next scene"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-lg font-normal mb-8 text-cyan-400">cosmic.cv</h1>
          <div className="mb-8">
            <h2 className="text-lg font-normal text-purple-300">HET SUTHAR</h2>
            <h3 className="text-lg font-normal text-gray-400">FULL STACK DEVELOPER & CLOUD ENTHUSIAST</h3>
          </div>
        </div>

        {/* Education Section */}
        <div className="mb-8 text-sm text-gray-400 leading-relaxed">
          <div className="text-cyan-400 mb-2">EDUCATION</div>
          <p className="text-gray-300">Bachelor of Engineering in Information Technology</p>
          <p className="text-gray-400">Sardar Vallabhbhai Patel Institute of Technology, Gujarat, India</p>
          <p className="text-gray-400">July 2022 – Present | CGPA: 7.50</p>
        </div>

        {/* Skills Section */}
        <div className="mb-8 text-sm text-gray-400 leading-relaxed">
          <div className="text-cyan-400 mb-2">SKILLS</div>
          <ul className="list-disc list-inside space-y-1">
            <li>Languages: Java (Intermediate), Python (Intermediate), JavaScript (Proficient), TypeScript (Beginner)</li>
            <li>Frameworks/Libraries: Next.js, React, Express, TailwindCSS, Prisma/Drizzle ORM, Zod, MonoRepo</li>
            <li>Databases: MySQL, MongoDB, PostgreSQL</li>
            <li>Tools: GitHub, Git, Postman, Cloudflare</li>
            <li>Cloud/DevOps: AWS (EC2, S3, Route 53, Elastic IP), Docker</li>
          </ul>
        </div>

        {/* Projects Section */}
        <div className="mb-8 text-sm text-gray-400 leading-relaxed">
          <div className="text-cyan-400 mb-2">PROJECTS</div>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>RAG Project – Talk to Your Data:</strong> Chat with PDFs using RAG (Gemini + Pinecone), Clerk Auth, S3, Drizzle ORM + Neon, deployed in Next.js full-stack.
            </li>
            <li>
              <strong>LLM-Powered Job Scraper:</strong> Chrome extension + Node.js backend + React dashboard with OpenAI/Gemini summaries. Deployed on AWS EC2 with Nginx.
            </li>
            <li>
              <strong>OnBlogs:</strong> Scalable blogging platform with React, Cloudflare Workers, PostgreSQL, Prisma ORM, and JWT/Zod validation.
            </li>
          </ul>
        </div>

        {/* Achievements */}
        <div className="mb-12 text-sm text-gray-400 leading-relaxed">
          <div className="text-cyan-400 mb-2">HONORS & CERTIFICATES</div>
          <ul className="list-disc list-inside space-y-2">
            <li>SSIP Grant Winner – Government of Gujarat (AI-powered identity document fraud detection tool)</li>
            <li>HackBangalore Finalist – Qualified in Global Hackathon organized by AngleHacks</li>
            <li>Ranked 9th in Department-level Mock Placement Round</li>
          </ul>
        </div>

        {/* Scene Info */}
        {isInteractiveMode && (
          <div className="mb-8 p-4 border border-purple-500/30 rounded bg-purple-950/20">
            <div className="text-sm text-purple-300">CURRENT ENTITY</div>
            <div className="text-xl font-bold text-purple-400">
              {manualScene + 1} / {totalEntities}
            </div>
          </div>
        )}

        {/* Footer Links Section */}
        <div className="absolute bottom-8 left-8">
          <div className="flex flex-wrap items-center gap-3 text-sm font-mono text-gray-500">
            <span className="text-cyan-400">Links</span>
            <a
              href="mailto:hetsuthar31@gmail.com"
              className="hover:text-purple-400 transition-colors"
            >
              Email
            </a>
            <a
              href="https://x.com/HetSuthar3369"
              target="_blank"
              rel="noreferrer"
              className="hover:text-purple-400 transition-colors"
            >
              Twitter
            </a>
            <a
              href="https://www.linkedin.com/in/het-suthar-00690a208/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-purple-400 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/hetsuthar963"
              target="_blank"
              rel="noreferrer"
              className="hover:text-purple-400 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Right Panel - Cosmic ASCII Animation */}
      <div className="w-1/2 relative overflow-hidden bg-black">
        <CosmicASCIIScene isInteractiveMode={isInteractiveMode} manualScene={manualScene} />
      </div>
    </div>
  )
}
