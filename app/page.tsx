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
  <p className="text-sm text-slate-400">Full-Stack Developer · AI/ML Integrations</p>
  <p className="mt-4 text-sm text-slate-300 leading-relaxed">
    Full-stack developer graduating in 2026, with hands-on experience shipping a production AI SaaS platform which is government grant-backed, 50+ users in the first month. Comfortable building across the stack API design, PostgreSQL, cloud deployment, and monitoring. Use AI tools like Claude and Cursor daily to move faster, and have built production LLM integrations and a RAG pipeline from scratch.
  </p>
</header>

<section className="cosmic-section" aria-label="Education">
  <h2 className="cosmic-heading">Education</h2>
  <ul className="cosmic-list">
    <li>
      <strong>B.E. in Information Technology</strong><br />
      Sardar Vallabhbhai Patel Institute of Technology, Gujarat<br />
      <span className="text-slate-400">July 2022 – Present (Expected Graduation: 2026) · CGPA: 7.73</span><br />
      <span className="text-slate-400 text-xs"><strong>Coursework:</strong> Object Oriented Programming (Java), Data Structures and Algorithms, Computer Networks, Database Management Systems, Operating Systems, Data Science, Web Development</span>
    </li>
  </ul>
</section>

<section className="cosmic-section" aria-label="Skills">
  <h2 className="cosmic-heading">Skills & Tools</h2>
  <div className="flex flex-col gap-4 mt-4">
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-300">Languages & Frontend</h3>
      <div className="flex flex-wrap gap-2">
        <img src="https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" className="h-6" />
        <img src="https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript" className="h-6" />
        <img src="https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white" alt="Python" className="h-6" />
        <img src="https://img.shields.io/badge/-Next.js-000000?logo=next.js&logoColor=white" alt="Next.js" className="h-6" />
        <img src="https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black" alt="React" className="h-6" />
        <img src="https://img.shields.io/badge/-Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" className="h-6" />
      </div>
    </div>

    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-300">Backend & Databases</h3>
      <div className="flex flex-wrap gap-2">
        <img src="https://img.shields.io/badge/-Node.js-339933?logo=nodedotjs&logoColor=white" alt="Node.js" className="h-6" />
        <img src="https://img.shields.io/badge/-FastAPI-009688?logo=fastapi&logoColor=white" alt="FastAPI" className="h-6" />
        <img src="https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white" alt="Express" className="h-6" />
        <img src="https://img.shields.io/badge/-Hono-FF9990?logo=hono&logoColor=white" alt="Hono" className="h-6" />
        <img src="https://img.shields.io/badge/-PostgreSQL-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" className="h-6" />
        <img src="https://img.shields.io/badge/-MongoDB-47A248?logo=mongodb&logoColor=white" alt="MongoDB" className="h-6" />
        <img src="https://img.shields.io/badge/-MySQL-4479A1?logo=mysql&logoColor=white" alt="MySQL" className="h-6" />
        <img src="https://img.shields.io/badge/-Prisma-2D3748?logo=prisma&logoColor=white" alt="Prisma" className="h-6" />
        <img src="https://img.shields.io/badge/-Drizzle-C5F74F?logo=drizzle&logoColor=black" alt="Drizzle" className="h-6" />
      </div>
    </div>

    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-300">Cloud & DevOps</h3>
      <div className="flex flex-wrap gap-2">
        <img src="https://img.shields.io/badge/-AWS-FF9900?logo=amazonaws&logoColor=white" alt="AWS" className="h-6" />
        <img src="https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white" alt="Docker" className="h-6" />
        <img src="https://img.shields.io/badge/-Cloudflare-F38020?logo=cloudflare&logoColor=white" alt="Cloudflare" className="h-6" />
        <img src="https://img.shields.io/badge/-DigitalOcean-2796ED?logo=digitalocean&logoColor=white" alt="DigitalOcean" className="h-6" />
        <img src="https://img.shields.io/badge/-Hetzner-D50C2D?logo=hetzner&logoColor=white" alt="Hetzner" className="h-6" />
        <img src="https://img.shields.io/badge/-Vercel-000000?logo=vercel&logoColor=white" alt="Vercel" className="h-6" />
        <img src="https://img.shields.io/badge/-GitHub_Actions-2088FF?logo=github-actions&logoColor=white" alt="GitHub Actions" className="h-6" />
      </div>
    </div>

    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-300">Monitoring & AI/ML</h3>
      <div className="flex flex-wrap gap-2">
        <img src="https://img.shields.io/badge/-New_Relic-008C99?logo=newrelic&logoColor=white" alt="New Relic" className="h-6" />
        <img src="https://img.shields.io/badge/-Prometheus-E6522C?logo=prometheus&logoColor=white" alt="Prometheus" className="h-6" />
        <img src="https://img.shields.io/badge/-Grafana-F46800?logo=grafana&logoColor=white" alt="Grafana" className="h-6" />
        <img src="https://img.shields.io/badge/-Pinecone-000000?logo=pinecone&logoColor=white" alt="Pinecone" className="h-6" />
      </div>
    </div>
  </div>
</section>

<section className="cosmic-section" aria-label="Experience">
  <h2 className="cosmic-heading">Experience</h2>
  <ul className="cosmic-list">
    <li>
      <strong>Xvertice — Project Owner & Full-Stack Lead</strong><br />
      <span className="text-slate-400">Feb 2025 – Jan 2026 · SSIP Grant, Government of Gujarat</span>
      <ul className="mt-2 space-y-1 list-disc list-outside ml-4 text-sm text-slate-300">
        <li>Secured a Government of Gujarat SSIP grant and led a 4-person team to build and ship an AI-powered image forensics SaaS that reached 50+ users, with 250+ forensic analyses processed and 2,300+ page views within the first 30 days of launch.</li>
        <li>Built the entire Next.js + TypeScript platform end-to-end along with all the API routes, PostgreSQL schema with Drizzle ORM, NeonDB as Database Host along with middleware-based auth with route protection using Clerk Auth.</li>
        <li>Deployed and integrated a Python FastAPI that contains CNN analysis and 12 forensic tests on Hetzner VPS by applying the strategy of Horizontal scaling via multiple Uvicorn workers managed by Gunicorn for parallel processing.</li>
        <li>Integrated a streaming AI pipeline (DeepSeek Reasoner), as well as reverse search API (Google, OpenWeb, TinyEye) with zod validation and AWS S3 as object storage.</li>
      </ul>
    </li>
  </ul>
</section>

<section className="cosmic-section" aria-label="Projects">
  <h2 className="cosmic-heading">Projects</h2>
  <ul className="cosmic-list">
    <li>
      <strong>Talk To Your Data — RAG Document Q/A</strong>
      <ul className="mt-1 space-y-1 list-disc list-outside ml-4 text-sm text-slate-300">
        <li>Developed a full-stack RAG pipeline enabling real-time chat with PDF documents using Gemini LLM and Pinecone vector database.</li>
        <li>Optimized data ingestion by implementing custom document chunking and AWS S3 object storage to handle high-density files.</li>
        <li>Built with Next.js and Drizzle ORM; enforced data integrity with a relational schema and secured user data via authentication middleware.</li>
      </ul>
    </li>
    <li className="mt-4">
      <strong>LLM Job Scraper — Chrome Extension + Dashboard</strong>
      <ul className="mt-1 space-y-1 list-disc list-outside ml-4 text-sm text-slate-300">
        <li>Built a Chrome extension that scrapes LinkedIn job listings to a Node.js + Express backend with MongoDB storage.</li>
        <li>LLM summarization on a React dashboard for filtering and ranking jobs deployed on AWS EC2.</li>
      </ul>
    </li>
    <li className="mt-4">
      <strong>OnBlogs</strong>
      <ul className="mt-1 space-y-1 list-disc list-outside ml-4 text-sm text-slate-300">
        <li>Developed a minimal blogging platform with a rich-text editor using Next.js and TypeScript.</li>
        <li>Implemented secure user authentication using BetterAuth lib with PostgreSQL, via Drizzle ORM.</li>
      </ul>
    </li>
  </ul>
</section>

<section className="cosmic-section" aria-label="Honors and Certificates">
  <h2 className="cosmic-heading">Honors & Certificates</h2>
  <ul className="cosmic-list">
    <li>SSIP Grant Recipient — Government of Gujarat, Govt. Recognised Project</li>
    <li>HackBangalore 2nd Round Qualifier — AngelHacks Global Hackathon Series, Bangalore</li>
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
