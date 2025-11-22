# MovieMatch - AI-Powered Movie Group Recommender

An autonomous AI-powered system that helps groups choose movies by running a shared quiz, collecting everyone's preferences, and generating group-friendly recommendations with clear explanations.

## What It Does

- Hosts shared movie-preference sessions for multiple users
- Sends a short quiz to each participant and tracks their progress
- Waits until everyone completes the quiz before continuing
- Generates group movie recommendations using an AI backend
- Produces explanations for why each movie was chosen
- Stores structured data in Supabase for easy session + user management
- Updates the frontend in real time as results become available

## Key Features

### Group Quiz Sessions
- One user creates a session
- Friends join using a shareable link or session code
- All answers are collected and synced across users

### AI-Driven Results
- Unified analysis of the entire group's preferences
- Movie recommendation tailored to the shared tastes of all participants
- Per-movie explanation section showing the reasoning behind each pick
- Movie posters fetched through TMDB API for each recommended movie

### Session Workflow Tracking
- Watches quiz progress for every participant
- Automatically triggers the recommendation pipeline when everyone is done
- Stores results + explanations back into the session record

## How It Works

1. **Session Creation**
   - A user creates a new movie session.
   - A unique session ID + join link is generated and stored in Supabase.

2. **User Participation**
   - Participants join the session, submit quiz answers, and mark their progress as complete.
   - All user data flows into the session_users table.

3. **Group Completion Detection**
   - Supabase Realtime triggers backend logic whenever a user finishes.
   - When all session participants are done:
     - Their answers are gathered
     - Passed to the AI engine (FastAPI)
     - AI returns movie recommendations + explanation text

4. **Result Storage**
   - The backend stores:
     - Recommended movies
     - Explanation metadata
     - Session status updates
   - Results are written into the sessions table as structured JSON.

5. **UI Update**
   - Frontend subscribers receive changes instantly and render:
     - Final movie picks
     - Explanation text for each movie
     - Session completion status

## Tech Stack

This project is built with:

- **Frontend Framework**: React 18 with TypeScript for type-safe component development
- **Build Tool**: Next.js 16 with Turbopack for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom design system variables for consistent theming and responsive design
- **UI Components**: shadcn/ui component library built on Radix UI primitives for accessible, customizable components
- **Routing**: Next.js App Router for client-side navigation and route management
- **State Management**: React Query (@tanstack/react-query) for server state management and caching
- **Icons**: Lucide React for consistent, scalable iconography
- **Forms**: React Hook Form with Zod validation for robust form handling and type-safe validation
- **Notifications**: Sonner for elegant toast notifications
- **Charts**: Recharts for data visualization components
- **Database**: Supabase for authentication, database, and real-time features
- **External APIs**: TMDB API for movie data and posters

## Getting Started

### Prerequisites

- Node.js & npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Installation

1. **Clone the repository**
   ```sh
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Start the development server**
   ```sh
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3000` to see the app in action

### Environment Setup

Create a `.env` file in the root directory and add your API keys:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TMDB_API_KEY=your_tmdb_api_key
```

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Future Updates

1. **Add Diversity Option**:
    - Add a toggle for host: for either "showing something which everyone likes" opposed to "something new for the group"
    - Change the embedding AI chooses to have room for novelty

2. **Group Chat/Voting**:
    - Let the AI choose 3 movies for users, let users vote and decide which movie to pick

## Contributing

We welcome contributions! Please follow our coding guidelines and ensure all changes maintain the established tech stack and library usage rules outlined in `AI_RULES.md`.

## License

This project is licensed under the MIT License.
