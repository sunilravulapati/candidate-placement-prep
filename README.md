# PrepGenie - AI Placement Operating System

PrepGenie is a premium AI-powered Placement Operating System designed to help candidates navigate the technical interview process. It features a suite of tools, from AI-driven resume intelligence to algorithmic problem sets.

## Features

- **Resume Intelligence**: Get your resume analyzed by an AI-powered technical recruiter. Features a 10-point deep breakdown, ATS compatibility scanning, and actionable semantic improvements.
- **DSA Practice**: Curated problem sets matching current company drives. Track progress and velocity over time.
- **Mock Interviews**: Voice-activated AI mock interviewer to simulate high-pressure tech rounds. (Coming Soon)
- **Knowledge Hub**: Your centralized repository of system design and computer science fundamentals. (Coming Soon)
- **Analytics**: Deep insights into your preparation journey to pinpoint weak areas before real interviews. (Coming Soon)

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Prisma ORM, PostgreSQL
- **AI Integration**: Groq SDK
- **Authentication**: Clerk

## Local Setup

### Prerequisites
- Node.js (v20+)
- PostgreSQL database
- Clerk Account
- Groq API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/prepgenie.git
   cd prepgenie
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../helper
   npm install
   ```

4. **Environment Variables**
   - Copy `.env.example` to `.env` in both `backend` and `helper` directories.
   - Fill in your API keys (Clerk, Database URL, Groq, etc.).

5. **Database Setup**
   - From the `backend` directory, initialize Prisma:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Run the Application**
   - Start the Next.js development server from the `helper` directory:
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:3000`.

## Architecture
See [Architecture.md](./Architecture.md) for detailed information on the platform's orchestration and design decisions.

## Contributing
We welcome contributions! Please see our Contributing Guide for details.

## License
MIT License
