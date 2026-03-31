import { useState } from 'react';
import { login } from '../services/api';
import { useAppStore } from '../store';

export default function LoginPage() {
  const setAuthed = useAppStore((s) => s.setAuthed);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(password);
      setAuthed(true);
    } catch {
      setError('Wrong password');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className={`login-card${shake ? ' shake' : ''}`}>
        <div className="login-logo">⚡</div>
        <div className="login-title">ANTIGRAVITY REMOTE</div>
        <div className="login-subtitle">Secure Neural Link</div>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="password"
            className="login-input"
            placeholder="Enter access code..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="current-password"
          />
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Connecting...' : 'CONNECT'}
          </button>
        </form>
      </div>
    </div>
  );
}
