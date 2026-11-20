'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getMe } from '../../lib/api';

export default function PatientBookingPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bookingId, setBookingId] = useState(null);

  // Role check, then load the doctor list.
  useEffect(() => {
    (async () => {
      const me = await getMe();
      if (!me || me.role !== 'patient') {
        router.replace('/login');
        return;
      }
      setReady(true);
      try {
        setDoctors(await api('/doctors'));
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [router]);

  async function loadSlots() {
    if (!doctorId) {
      setSlots([]);
      return;
    }
    try {
      setSlots(await api('/doctors/' + doctorId + '/slots' + (date ? '?date=' + date : '')));
    } catch (err) {
      setError(err.message);
      setSlots([]);
    }
  }

  // Reload free slots whenever the doctor or the date changes.
  useEffect(() => {
    if (!ready) return;
    setError('');
    setSuccess('');
    loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, doctorId, date]);

  async function book(slotId) {
    setError('');
    setSuccess('');
    setBookingId(slotId);
    try {
      await api('/appointments', { method: 'POST', body: { slotId, reason: reason.trim() || undefined } });
      setSuccess('Booked');
      setReason('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBookingId(null);
      await loadSlots();
    }
  }

  if (!ready) return <p>Loading…</p>;

  return (
    <div>
      <h1>Book an appointment</h1>

      <div className="card">
        <label>
          Doctor
          <br />
          <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            <option value="">Choose a doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.specialization})
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Date (optional)
          <br />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <br />
        <label>
          Reason (optional)
          <br />
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Fever" />
        </label>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {doctorId && (
        <div className="card">
          <h3>Free slots</h3>
          {slots.length === 0 ? (
            <p>No free slots{date ? ' on this date' : ''}.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Start</th>
                  <th>End</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {slots.map((s) => (
                  <tr key={s.id}>
                    <td>{s.date}</td>
                    <td>{s.startTime}</td>
                    <td>{s.endTime}</td>
                    <td>
                      <button className="btn" onClick={() => book(s.id)} disabled={bookingId !== null}>
                        {bookingId === s.id ? 'Booking…' : 'Book'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
