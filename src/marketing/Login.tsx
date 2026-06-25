import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, authErrorMessage } from '../lib/AuthContext';
import './Auth.css';

export default function Login() {
  const { logIn, configured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!form.email.trim() || !form.password) { setErr('Enter your email and password.'); return; }
    setBusy(true);
    try {
      await logIn(form.email.trim(), form.password);
      navigate(from, { replace: true });
    } catch (e) {
      setErr(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cc-auth">
      <div className="cc-auth-card">
        <Link to="/" className="cc-auth-brand">
          <span className="cc-auth-mark"><span /></span> CloseCRM
        </Link>
        <h1>Welcome back</h1>
        <p className="cc-auth-sub">Log in to your workspace.</p>

        {!configured && (
          <div className="cc-auth-notice">
            Firebase isn’t configured yet. Add your keys to <code>.env</code> (see <code>.env.example</code>) and restart the dev server to enable login.
          </div>
        )}
        {err && <div className="cc-auth-error">{err}</div>}

        <form onSubmit={submit}>
          <label><span>Email</span>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@company.com" autoComplete="email" />
          </label>
          <label><span>Password</span>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Your password" autoComplete="current-password" />
          </label>
          <button type="submit" className="cc-btn cc-btn-primary cc-btn-block" disabled={busy || !configured}>
            {busy ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="cc-auth-alt">New to CloseCRM? <Link to="/signup">Create an account</Link></p>
      </div>
    </div>
  );
}
