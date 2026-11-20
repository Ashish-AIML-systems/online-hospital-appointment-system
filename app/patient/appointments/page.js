'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getMe } from '../../../lib/api';
import NotificationList from '../../../components/NotificationList';

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  // Changing this key re-mounts <NotificationList /> so the new cancellation notice shows straight away.
  const [notificationsKey, setNotificationsKey] = useState(0);

  async function load() {
    try {
      setAppointments(await api('/appointments'));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    (async () => {
      const me = await getMe();
      if (!me || me.role !== 'patient') {
        router.replace('/login');
        return;
      }
      setReady(true);
      await load();
    })();
  }, [router]);

  async function cancel(id) {
    setError('');
    setCancellingId(id);
    try {
      await api('/appointments/' + id + '/cancel', { method: 'PATCH' });
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
      await load();
      setNotificationsKey((k) => k + 1);
    }
  }

  if (!ready) return <p>Loading…</p>;

  return (
    <div>
      <h1>My appointments</h1>
      {error && <p className="error">{error}</p>}

      <div className="card">
        {appointments.length === 0 ? (
          <p>You have no appointments yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Doctor</th>
                <th>Reason</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{a.date}</td>
                  <td>
                    {a.startTime}–{a.endTime}
                  </td>
                  <td>{a.doctorName}</td>
                  <td>{a.reason || '—'}</td>
                  <td>{a.status}</td>
                  <td>
                    {a.status === 'BOOKED' && (
                      <button className="btn" onClick={() => cancel(a.id)} disabled={cancellingId !== null}>
                        {cancellingId === a.id ? 'Cancelling…' : 'Cancel'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <NotificationList key={notificationsKey} />
    </div>
  );
}
