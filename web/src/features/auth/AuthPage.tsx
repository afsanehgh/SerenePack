import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, PawPrint, ShieldCheck, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import Button from '../../components/ui/Button';
import TextField from '../../components/ui/TextField';
import { clearAuthError, login, register } from './authSlice';

export default function AuthPage({
  register: isRegister = false,
}: {
  register?: boolean;
}) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAppSelector((state) => state.auth.status);
  const error = useAppSelector((state) => state.auth.error);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(clearAuthError());
    try {
      const credentials = { email: email.trim(), password };
      if (isRegister) await dispatch(register(credentials)).unwrap();
      else await dispatch(login(credentials)).unwrap();
      navigate('/', { replace: true });
    } catch {
      // The rejected thunk stores a safe, user-facing message in the auth slice.
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-story" aria-label="PetRegister introduction">
        <Link className="brand brand--light" to="/login">
          <span className="brand__mark">
            <PawPrint size={21} />
          </span>
          <span>PetRegister</span>
        </Link>
        <div className="auth-story__content">
          <span className="eyebrow eyebrow--light">
            <Sparkles size={14} /> A little more peace of mind
          </span>
          <h1>Every little detail, in good hands.</h1>
          <p>
            One calm place for the names, stories, and details that make each
            pet yours.
          </p>
          <div className="story-note">
            <span className="story-note__icon">
              <ShieldCheck size={18} />
            </span>
            <span>
              <strong>Just for you</strong>
              <small>Your pet records stay private to your account.</small>
            </span>
          </div>
        </div>
        <p className="auth-story__foot">
          Thoughtfully made for the ones who care.
        </p>
        <div className="auth-orbit auth-orbit--one" aria-hidden="true" />
        <div className="auth-orbit auth-orbit--two" aria-hidden="true" />
      </section>

      <section className="auth-panel">
        <div className="auth-panel__mobile-brand">
          <Link className="brand" to="/login">
            <span className="brand__mark">
              <PawPrint size={21} />
            </span>
            <span>PetRegister</span>
          </Link>
        </div>
        <div className="auth-card">
          <span className="eyebrow">
            {isRegister ? 'YOUR NEW SPACE' : 'WELCOME BACK'}
          </span>
          <h2>
            {isRegister ? 'Make room for every story.' : 'Good to see you.'}
          </h2>
          <p className="auth-card__intro">
            {isRegister
              ? 'Create an account to start keeping your pet details together.'
              : 'Sign in to pick up right where you left off.'}
          </p>

          {error && (
            <div className="form-alert" role="alert">
              {error}
            </div>
          )}

          <form className="form-stack" onSubmit={handleSubmit}>
            <TextField
              autoComplete="email"
              label="Email address"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
            <TextField
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              label="Password"
              minLength={isRegister ? 12 : 1}
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder={
                isRegister ? 'At least 12 characters' : 'Your password'
              }
              required
              type="password"
              value={password}
            />
            {isRegister && (
              <p className="field-hint">
                Use at least 12 characters to help protect your account.
              </p>
            )}
            <Button
              className="auth-submit"
              disabled={status === 'loading'}
              icon={<ArrowRight size={17} />}
              type="submit"
            >
              {status === 'loading'
                ? 'One moment…'
                : isRegister
                  ? 'Create your account'
                  : 'Sign in'}
            </Button>
          </form>

          <p className="auth-switch">
            {isRegister ? 'Already have an account?' : 'New to PetRegister?'}{' '}
            <Link to={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </div>
        <p className="auth-panel__legal">
          Simple, private, and made with care.
        </p>
      </section>
    </main>
  );
}
