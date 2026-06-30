# AGENTS.md

This file is a reference for AI coding agents working on this project. It describes the actual architecture, conventions, and tooling as found in the codebase.

## Important: Next.js Version Note

This project uses **Next.js 16.2.9**, which has breaking changes compared to earlier versions. APIs, conventions, and file structure may differ from older Next.js training data. Before writing any Next.js-specific code, read the relevant guide in `node_modules/next/dist/docs/` and heed any deprecation notices.

## Project Overview

This is a personal portfolio and blog site for "Owen". It is a statically-exported Next.js application with a heavy focus on motion design, WebGL backgrounds, and custom page transitions.

Key characteristics:

- Static site export (`output: 'export'` in `next.config.ts`).
- Content-driven articles written in MDX.
- Custom loading screen, page-transition system, and cursor effects.
- WebGL ink-fluid background rendered with React Three Fiber.
- Dark-only visual theme.
- Bilingual content: UI text and code comments are in English; article bodies are mostly in Chinese.

## Technology Stack

- **Framework:** Next.js 16.2.9 (App Router, static export)
- **Runtime / Language:** React 19.2.4, TypeScript 5, Node 20+
- **Package Manager:** pnpm (see `pnpm-workspace.yaml`, even though it is a single package)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`), custom CSS in `assets/`
- **Animation:** GSAP 3 with SplitText, ScrollTrigger, Flip, and `@gsap/react`
- **WebGL:** `three`, `@react-three/fiber`, `@react-three/drei`
- **Content:** MDX via `@next/mdx`, `gray-matter`, `remark`, `rehype-slug`, `@shikijs/rehype`
- **Icons:** `lucide-react`
- **Utilities:** `classnames`, `dayjs`, `lodash-es`, `github-slugger`
- **Formatting:** `oxfmt` (configured in `.oxfmtrc.json` and `.vscode/settings.json`)
- **Linting:** ESLint 9 with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`

No testing framework is currently configured.

## Project Structure

```
.
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home page
│   ├── layout.tsx          # Root layout (font, navbar, loader, transition wrapper)
│   ├── about/              # /about
│   ├── play/               # /play (placeholder)
│   └── writings/           # /writings and /writings/[slug]
├── components/             # React components
│   ├── Callout/            # MDX callout component
│   ├── CursorLabel/        # Custom cursor label wrapper
│   ├── FlipText/           # Hover text-flip effect
│   ├── HeroScene/          # WebGL background scene
│   ├── HeroTitle/          # Large animated home title
│   ├── Link/               # Transition-aware Next.js link
│   ├── Loader/             # Loading screen + context
│   ├── MobileMenu/         # Mobile navigation overlay
│   ├── Navbar/             # Fixed site navigation
│   └── Transition/         # GSAP page-transition wrapper
├── content/                # Source content
│   └── writings/           # MDX articles
├── hooks/                  # Custom React hooks
├── lib/                    # Shared helpers
│   ├── content.ts          # Read and parse MDX articles
│   ├── gsap.ts             # Centralized GSAP plugin registration
│   └── theme.ts            # Theme colors shared with shaders
├── assets/                 # Global CSS, app CSS, local font
├── public/img/             # Static images referenced by articles
├── types/common.d.ts       # Shared TypeScript interfaces
└── mdx-components.tsx      # Global MDX component mappings
```

## Build and Development Commands

All commands are run with pnpm:

```bash
# Start the development server (Turbopack)
pnpm dev

# Build the static site
pnpm build

# Serve the production build
pnpm start

# Run ESLint
pnpm lint
```

The dev server runs on `http://localhost:3000` by default.

`pnpm build` produces a static export in the `out/` directory. The build output is committed to `.gitignore` and should not be checked in.

## Routing

The app uses the Next.js App Router.

| Route | File | Notes |
|-------|------|-------|
| `/` | `app/page.tsx` | Home page with HeroScene and intro text |
| `/about` | `app/about/page.tsx` | Personal bio and "SITREP" list |
| `/play` | `app/play/page.tsx` | Placeholder playground page |
| `/writings` | `app/writings/page.tsx` | Article list |
| `/writings/[slug]` | `app/writings/[slug]/page.tsx` | Individual MDX article |

Dynamic article routes are generated at build time via `generateStaticParams`. `dynamicParams` is set to `false`, so unknown slugs return 404.

## Content (MDX Articles)

Articles live in `content/writings/*.mdx`. Each article must begin with YAML frontmatter:

```yaml
---
title: Article Title
date: YYYY.MM.DD
excerpt: Short description
topic:
  - tag-one
  - tag-two
---
```

- `title`, `date`, `excerpt`, and `topic` are required by the article list and detail pages.
- `topic` is an array of strings.
- The `slug` is derived from the filename (`{slug}.mdx`).
- Article headings (`h2`–`h4`) are extracted in `lib/content.ts` for the table of contents.

Global MDX components are registered in `mdx-components.tsx`. Currently the only custom component is `<Callout>`.

Code blocks are syntax-highlighted by `@shikijs/rehype` using the `kanagawa-wave` theme.

## Styling and Theming

- Tailwind CSS v4 is configured in `assets/globals.css` using the new `@theme inline` block.
- Theme tokens (colors, font sizes, line heights) are defined as CSS custom properties in `globals.css` and consumed as Tailwind utilities (e.g. `text-text-primary`, `bg-bg-primary`).
- `assets/app.css` holds ad-hoc utility classes and component-specific overrides that are awkward to express with Tailwind utilities (e.g. `.nav-link`, `.title .title-text`, `.no-scrollbar`, `.mask-fade-y`).
- The site is dark-only (`color-scheme: dark`).
- Theme colors used by both CSS and WebGL shaders are duplicated in `lib/theme.ts`; if you change the palette, keep `lib/theme.ts` and `assets/globals.css` in sync.
- The display font is a local WOFF2 (`assets/clash.woff2`) loaded with `next/font/local`.

## Animation and Transitions

This project has a coordinated animation system spread across several components:

- **Loader (`components/Loader`)**: A full-screen loading overlay that waits for fonts, window load, a minimum visible duration, and any scene-ready signals. It exposes `isReadyForEnter` to child components.
- **Transition (`components/Transition`)**: Wraps page content and runs GSAP blur/fade transitions on route changes. It integrates with the custom `Link` component via `components/Link/registry.ts`.
- **Link (`components/Link`)**: Wraps `next/link` and triggers the transition animation for same-origin navigation, unless the link points to the current pathname or uses modifier keys/external targets.
- **Navbar / FlipText**: Navbar links use `FlipText` for a vertical character-flip hover effect.
- **HeroScene**: A React Three Fiber canvas that renders an interactive ink-fluid shader background. It uses a feedback/ping-pong render pass and follows the cursor.
- **ArticleList / CursorLabel**: The writings list uses a custom cursor label that follows the mouse on hover.

Most page enter animations are gated on `isReadyForEnter` from the loader context. If you add a new page with heavy initial animations, signal readiness or wait for this flag.

## Code Style and Formatting

- **Formatter:** `oxfmt` (Oxford formatter).
- **Config:** `.oxfmtrc.json`
  - `semi: false`
  - `singleQuote: true`
  - `jsxSingleQuote: false`
  - `printWidth: 100`
  - Ignored: `*.json`, `*.nofmt.*`, `*.md`, `*.mdx`
- VS Code is configured to format on save with the OXC extension (`.vscode/settings.json`).
- Prefer named default exports for page and component files.
- Use `classnames` (aliased as `cn`) for conditional classes.
- Import path alias `@/*` maps to the project root.
- TypeScript strict mode is enabled.

## Linting

ESLint 9 is configured in `eslint.config.mjs` using the flat config format:

```js
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
```

Default ignored directories (`.next/`, `out/`, `build/`, `next-env.d.ts`) are explicitly listed. Run with `pnpm lint`.

## Deployment

Because `output: 'export'` is set, the app is built as a static site in `out/` and can be deployed to any static host (Vercel, Netlify, GitHub Pages, etc.). The README suggests Vercel as the default target.

Static images used by articles are in `public/img/` and are copied to the output automatically.

## Security and Performance Notes

- Environment variables (`.env*`) are gitignored. There are no visible runtime secrets in the source.
- Images are served unoptimized (`images: { unoptimized: true }`) because the static export does not run the Next.js image optimization server.
- The WebGL scene uses `PerformanceMonitor` and `AdaptiveDpr` to lower the DPR on slower devices.
- Pointer events for the shader and cursor are throttled or driven by GSAP `quickTo` to avoid excessive work per frame.
- Body scroll is locked during the initial load and restored by `Loader` on exit; `MobileMenu` also locks scroll while open.

## Agent Guidelines

- Do not assume standard Next.js behavior; verify against the installed `next` version and its docs.
- Keep changes minimal and consistent with the existing animation-heavy style.
- If you modify theme colors, update both `assets/globals.css` and `lib/theme.ts`.
- When adding a new article, place the `.mdx` file in `content/writings/` with the required frontmatter.
- If you introduce a new MDX component, register it in `mdx-components.tsx`.
- Run `pnpm build` before finishing to ensure the static export still succeeds.
