export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  // Remove server-side onboarding status check and redirect logic
  // Let the client-side AuthFlowManager handle all onboarding status checks and redirects
  // This prevents NEXT_REDIRECT errors and ensures consistent behavior
  return <>{children}</>
}
