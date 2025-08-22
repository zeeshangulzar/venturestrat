// types/globals.ts
export type Roles = 'admin' | 'moderator'

// Global type declarations
declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles,
      onboardingComplete?: boolean,
    };
  }
}

export {}