'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <h1>Online Hospital Appointments</h1>
      <p>Patients can see doctors, pick a free time slot and book or cancel an appointment online.</p>
      <p>
        <Link href="/login" className="btn">Login</Link>{' '}
        <Link href="/register" className="btn">Register</Link>
      </p>
    </div>
  );
}
