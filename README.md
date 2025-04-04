# BITSAT Practice App

A personal practice application for BITSAT exam preparation.

## Features

- Dark mode UI
- LaTeX support for mathematical equations
- Stopwatch with customizable time thresholds
- Question filtering by subject, topic, and source
- Daily goal tracking
- Progress saving via localStorage

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/bitstorm.git
cd bitstorm
```

2. Install dependencies
```bash
npm install --legacy-peer-deps
# or
yarn install --legacy-peer-deps
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment on Vercel

The easiest way to deploy this app is to use the [Vercel Platform](https://vercel.com/).

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. In the build settings, set the install command to:
   ```
   npm install --legacy-peer-deps
   ```
4. Deploy!

## Technology Stack

- Next.js 15
- React 19
- Tailwind CSS
- shadcn/ui
- Zustand for state management
- KaTeX for LaTeX rendering
