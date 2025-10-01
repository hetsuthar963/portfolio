# Cosmic Resume Portfolio

A cinematic, ASCII-driven developer resume built with Next.js 14, Tailwind CSS, and a custom cosmic animation widget.

## ✨ Features

- **Responsive resume layout** with a toggleable sidebar that houses project, education, skills, and contact links.
- **Lazy-loaded cosmic ASCII widget** that renders calm, hardware-accelerated animations and adapts to mobile/desktop viewports.
- **Interactive/auto playback controls** for cycling through 200+ cosmic entities with reduced ambient noise for clarity.
- **Downloadable PDF resume button** and accessible navigation with ARIA labels across the UI.
- **Performance optimizations** including GPU acceleration, reduced-motion support, and constrained repaint regions.

## 🧱 Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router) + React 18
- Tailwind CSS with custom layers/utilities for animation
- `react-icons`/`lucide-react` for iconography
- Custom animation engine (`components/cosmic-ascii-scene.tsx`) with entity data in `data/cosmic-entities.json`

## 🚀 Getting Started

```bash
pnpm install   # or npm install / yarn install
pnpm dev       # starts next dev server on http://localhost:3000
pnpm build     # production build
pnpm start     # run the built output
```

Place your PDF resume in `/public/Latest_Resume_01.pdf` (existing file name) to keep the download button working.

## 🛠 Project Structure

```
app/
  layout.tsx         # Root layout with font injection and analytics
  page.tsx           # Resume layout, sidebar toggle, widget controls
components/
  cosmic-ascii-scene.tsx  # Canvas-based animation logic
  theme-provider.tsx      # Dark mode support (next-themes)
data/
  cosmic-entities.json    # Animation entity metadata
public/
  Latest_Resume_01.pdf    # Downloadable resume (replace with your PDF)
```

## ♾ Cosmic Widget License

```
Cosmic Widget MIT License

Copyright (c) 2025 Het Suthar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🤝 Contributing

1. Fork and clone the repo
2. Create a feature branch (`git checkout -b feature/cool-idea`)
3. Commit changes (`git commit -m "Add: cool idea"`)
4. Push (`git push origin feature/cool-idea`)
5. Open a pull request

## 📄 License

- Resume layout and styling: MIT (root project)
- Cosmic widget animation engine: licensed separately under the "Cosmic Widget MIT" terms above.
