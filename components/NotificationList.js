'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function NotificationList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    try {
      const list = await api('/notifications');
      // The API already sends newest first; sort again so the list never depends on it.
      setItems([...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    setError('');
    try {
      await api('/notifications/read', { method: 'PATCH' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="card">
      <h3>Notifications</h3>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <>
          <button className="btn" onClick={markAllRead}>
            Mark all read
          </button>
          <ul>
            {items.map((n) => (
              <li key={n.id} style={{ fontWeight: n.isRead ? 'normal' : 'bold' }}>
                {n.message} <small>({new Date(n.createdAt).toLocaleString()})</small>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
