import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { fetchUserData } from '@lib/api'

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  
  if (userId) {
    try {
      // Check onboarding status from backend
      const userData = await fetchUserData(userId) as { user?: { onboardingComplete?: boolean }; onboardingComplete?: boolean }
      const actualUserData = userData.user || userData
      
      if (actualUserData.onboardingComplete === true) {
        redirect('/')
      }
    } catch (error) {
      console.error('Failed to check onboarding status from backend:', error)
      // Fallback to Clerk metadata if backend fails
      const { sessionClaims } = await auth()
      if (false) { // Fallback disabled since we're not using Clerk metadata anymore
        redirect('/')
      }
    }
  }

  return <>{children}</>
}
