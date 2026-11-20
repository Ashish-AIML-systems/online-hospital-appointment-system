'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';

const HOME_FOR_ROLE = { patient: '/patient', doctor: '/doctor', admin: '/admin' };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await api('/auth/login', { method: 'POST', body: { email, password } });
      router.push(HOME_FOR_ROLE[user.role] || '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <br />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <br />
        <label>
          Password
          <br />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <br />
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Logging in…' : 'Login'}
        </button>
      </form>
      <p>
        New patient? <Link href="/register">Register</Link>
      </p>
    </div>
  );
}
