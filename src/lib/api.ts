// src/lib/api.ts

// Utility function to get the API URL from the environment
export const getApiUrl = (path: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';  // Default to localhost in case env is not set
  return `${baseUrl}${path}`;
};
