import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useAuth, authErrorMessage } from '../lib/AuthContext';
import './Auth.css';

export default function Signup() {
  const { signUp, configured } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      setErr('Enter your name, email, and a password of at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      await signUp(form.name.trim(), form.email.trim(), form.password);
      navigate('/dashboard', { replace: true });
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
        <h1>Create your account</h1>
        <p className="cc-auth-sub">Start organizing your pipeline in minutes. No credit card required.</p>

        {!configured && (
          <div className="cc-auth-notice">
            Firebase isn’t configured yet. Add your keys to <code>.env</code> (see <code>.env.example</code>) and restart the dev server to enable sign-up.
          </div>
        )}
        {err && <div className="cc-auth-error">{err}</div>}

        <form onSubmit={submit}>
          <label><span>Full name</span>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jane Cooper" autoComplete="name" />
          </label>
          <label><span>Work email</span>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@company.com" autoComplete="email" />
          </label>
          <label><span>Password</span>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" autoComplete="new-password" />
          </label>
          <button type="submit" className="cc-btn cc-btn-primary cc-btn-block" disabled={busy || !configured}>
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <ul className="cc-auth-perks">
          <li><Check size={14} /> Your own private workspace</li>
          <li><Check size={14} /> 14-day free trial of every feature</li>
        </ul>

        <p className="cc-auth-alt">Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}
