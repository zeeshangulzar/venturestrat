// app/sso-callback/[[...slug]]/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import SSOCallback from '@components/SsoCallback'

export default function SSOCallbackPage() {
  return <SSOCallback />
}