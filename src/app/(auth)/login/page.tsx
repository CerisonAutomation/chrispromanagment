/**
 * @fileoverview (auth)/login — canonical login lives at /admin/login.
 * This route exists only to preserve any old links; it immediately redirects.
 */
import { redirect } from 'next/navigation';

export default function AuthLoginPage() {
  redirect('/admin/login');
}
