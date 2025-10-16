// app/admin/page.tsx
import { redirect } from 'next/navigation'

export default function AdminPage() {
  // Redirect admin users to the users list page
  redirect('/admin/users')
}
