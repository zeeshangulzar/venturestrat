// app/(public)/sign-in/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import SignInPage from "@components/SignInPage";

export default function SignIn() {
  return <SignInPage />;
}