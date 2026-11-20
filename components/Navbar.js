'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api, getMe } from '../lib/api';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  // Re-check on every page change so the links update right after login or logout.
  useEffect(() => {
    getMe().then(setUser);
  }, [pathname]);

  async function logout() {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // Go to login anyway; the cookie is cleared server-side when the call works.
    }
    setUser(null);
    router.push('/login');
  }

  const linkStyle = { marginRight: 16 };

  return (
    <nav style={{ borderBottom: '1px solid #d9dee5', padding: '12px 16px' }}>
      <strong style={linkStyle}>Hospital Appointments</strong>
      {!user && (
        <>
          <Link href="/" style={linkStyle}>Home</Link>
          <Link href="/login" style={linkStyle}>Login</Link>
          <Link href="/register" style={linkStyle}>Register</Link>
        </>
      )}
      {user?.role === 'patient' && (
        <>
          <Link href="/patient" style={linkStyle}>Book</Link>
          <Link href="/patient/appointments" style={linkStyle}>My appointments</Link>
        </>
      )}
      {user?.role === 'doctor' && <Link href="/doctor" style={linkStyle}>Dashboard</Link>}
      {user?.role === 'admin' && <Link href="/admin" style={linkStyle}>Admin</Link>}
      {user && (
        <button className="btn" onClick={logout}>
          Logout
        </button>
      )}
    </nav>
  );
}
