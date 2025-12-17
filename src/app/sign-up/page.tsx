// app/(public)/sign-up/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
import SignUpPageComponent from '@components/SignUpPage';



export default function SignUpPage() {
  return <SignUpPageComponent />;
}
