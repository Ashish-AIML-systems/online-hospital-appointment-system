'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setBusy(true);
    try {
      await api('/auth/register', { method: 'POST', body: { name, email, password } });
      router.push('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name
          <br />
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <br />
        <label>
          Email
          <br />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <br />
        <label>
          Password (at least 6 characters)
          <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
        <br />
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Registering…' : 'Register'}
        </button>
      </form>
      <p>
        Already have an account? <Link href="/login">Login</Link>
      </p>
    </div>
  );
}
