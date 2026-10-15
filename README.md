# Fitness Tracker

A Next.js app where you log a workout (what you did and for how long), then an AI estimates how many calories you burned via the OpenAI API.

## Stack

- **Next.js** (App Router) — React framework with server routes for the API
- **TypeScript** — typed JavaScript
- **Tailwind CSS** — utility-first styling
- **OpenAI API** — calorie estimation (coming in a later step)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build plan (step by step)

1. **Scaffold Next.js project** ← you are here
2. Workout input UI (description + duration)
3. API route that calls OpenAI for calorie estimates
4. Wire the form to the API and show results
5. Optional: save workout history

## Environment variables

Copy `.env.example` to `.env.local` when we add OpenAI (Step 3):

```bash
cp .env.example .env.local
```

## Deploy (Vercel)

`vercel.json` forces the **Next.js** framework preset and `next build`, so preview
deploys do not keep using the old Vite/`dist` settings from earlier projects.
