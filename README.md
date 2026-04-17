# 🐾 OpenClaw

> AI-powered hotel booking platform with real-time local events integration, optimized for SEA markets.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

## Mission

Traditional hotel platforms separate accommodation search from local experiences. OpenClaw merges them using AI — find a hotel that's perfect for your trip AND see what's happening in the city during your stay, all in one conversation.

## Demo Coverage

4 cities as proof of global + local coverage:
- Tokyo, Japan
- Bangkok, Thailand  
- Paris, France
- Hat Yai, Thailand

## Features

- **AI agent** conversational search (Thai + English)
- **Real-time hotel availability** via LiteAPI (2M+ properties)
- **Local events** — festivals, concerts, exhibitions on your travel dates
- **Real booking** in sandbox mode — not mock
- **Interactive map** with OpenStreetMap
- **Bilingual** Thai & English, Baht & USD

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase (Postgres 16 + pgvector) |
| Auth | Supabase Auth |
| Cache | Upstash Redis |
| Jobs | Inngest |
| LLM | Gemini 2.5 Flash (primary) / Claude Haiku 4.5 (fallback) |
| Hotels | LiteAPI |
| Events | Ticketmaster + SerpAPI + OSM Overpass |
| Payments | Stripe (test mode) |
| Deployment | Vercel |
| Monitoring | Sentry + PostHog + Langfuse |

##  Team

- [@ซาน](https://github.com/ซาน) — Frontend / UX
- [@โมท](https://github.com/โมท) — Backend / API
- [@เหม่ย](https://github.com/เหม่ย) — AI / Data

## License

MIT — see [LICENSE](LICENSE) for details.

##  Status

**Research preview** — built as a demo project. Not yet available for commercial use.