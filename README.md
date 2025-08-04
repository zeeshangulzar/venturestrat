# Neda Frontend

This is the frontend for the Neda platform.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Language**: TypeScript
- **Package Manager**: pnpm

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- [pnpm](https://pnpm.io/installation)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/neda-frontend.git
   cd neda-frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy the environment config and update the variables:
   ```bash
   cp .env.local.example .env.local
   ```

4. Inside `.env.local`, set:
   ```ini
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
   ```

## Common Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the development server |
| `pnpm build` | Build the project for production |
| `pnpm lint` | Run ESLint on the codebase |
| `pnpm install` | Install dependencies |

## Project Structure

```
src/
  app/           # App Router pages
  components/    # Reusable UI components
  styles/        # Tailwind/global styles
  lib/           # Utilities and API logic
public/          # Static assets
```

## Authentication

This app uses Clerk for authentication.

- `SignedIn`, `SignedOut` components toggle content based on auth state.
- `SignInButton`, `SignUpButton`, and `UserButton` are included in the layout.

## API Connection

Data is fetched from your backend using the environment variable `NEXT_PUBLIC_API_URL`.

Example:
```ts
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/brokers`)
```

