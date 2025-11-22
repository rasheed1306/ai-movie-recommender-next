# AI Development Guidelines for MovieMatch

This document provides rules and guidelines for the AI developer to follow when working on the MovieMatch application. Adhering to these rules ensures consistency, maintainability, and quality in the codebase.

## Core Tech Stack

The application is built on a modern, type-safe, and efficient technology stack. All new development must conform to this stack.

- **Framework**: **Next.js** using the App Router for file-based routing and server components.
- **Language**: **TypeScript** for all frontend code to ensure type safety.
- **Styling**: **Tailwind CSS** for all styling. Utility-first classes are mandatory.
- **UI Components**: **shadcn/ui** is the primary component library, built on Radix UI for accessibility.
- **Server State Management**: **TanStack Query (React Query)** for fetching, caching, and synchronizing server state.
- **Forms**: **React Hook Form** for building forms, combined with **Zod** for robust, type-safe validation.
- **Icons**: **Lucide React** for all icons to ensure a consistent visual language.
- **Notifications**: **Sonner** for displaying non-intrusive toast notifications.
- **Backend & Database**: **Supabase** for authentication, database storage, and real-time capabilities.

## Library Usage Rules

To maintain consistency, follow these specific rules for using libraries and implementing features.

### 1. UI and Styling
- **Component Library**: **ALWAYS** use components from `shadcn/ui` (`@/components/ui`) whenever possible. Do not reinvent common UI elements like buttons, dialogs, inputs, or cards.
- **Styling**: **ONLY** use Tailwind CSS utility classes for styling. Do not write custom CSS in `.css` files or use inline `style` attributes, except for dynamic values that cannot be handled by Tailwind.
- **Class Merging**: **ALWAYS** use the `cn` utility function from `src/lib/utils.ts` when applying conditional or combined classes to components. This prevents Tailwind class conflicts.

### 2. State Management
- **Server State**: **MUST** use TanStack Query (`useQuery`, `useMutation`) for all interactions with the Supabase backend (fetching, creating, updating, deleting data).
- **Client State**: For simple, component-level state, use React's built-in hooks (`useState`, `useReducer`). Do not introduce a global client state library (like Zustand or Redux).

### 3. Forms
- **Form Logic**: **ALL** forms must be implemented using `React Hook Form`.
- **Validation**: **ALL** form validation must be handled using `Zod` schemas passed to the `useForm` hook's resolver.

### 4. Backend and Data
- **Database Interaction**: **ALL** communication with the backend must be done through the official Supabase client.
- **Authentication**: Use Supabase Auth for all user authentication features.

### 5. Icons and Notifications
- **Icons**: **ONLY** use icons from the `lucide-react` library.
- **User Feedback**: Use `sonner` to provide toast notifications for actions like successful form submissions or errors.

### 6. Routing and Navigation
- **Internal Links**: Use the Next.js `<Link>` component for all internal navigation.
- **Programmatic Navigation**: Use the `useRouter` hook from `next/navigation` for any programmatic redirects or navigation.