import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../components/common/authcontext';
import type { JSX } from 'react';
import styles from './LoginPage.module.css';

export function Protectedroute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const redirect = encodeURIComponent(location.pathname);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return children;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const fromPath = location.state?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const isValidEmail = (email: string) => {
    const trimmed = email.trim();
    return (
      email === trimmed &&
      !/\s/.test(email) &&
      email.includes('@')
    );
  };

  const isValidPassword = (pwd: string) => {
    const trimmed = pwd.trim();
    return (
      pwd === trimmed &&
      !/\s/.test(pwd) &&
      pwd.length >= 8
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;

    if (!isValidEmail(email)) {
      setEmailError('Email must be valid and contain no spaces.');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!isValidPassword(password)) {
      setPasswordError('Password must be at least 8 characters with no spaces.');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) return;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Store user and update context
        const user = {
          id: data.userId,
          name: data.name,
          email: email.trim(),
        };
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);

        alert('Login successful!');
        navigate(fromPath);
      } else {
        const error = await response.json();
        alert(error.message || 'Login failed.');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Sign in</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="text"
            className={`${styles.input} ${emailError ? styles.invalid : ''}`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
          />
          {emailError && <div className={styles.error}>{emailError}</div>}

          <label>Password</label>
          <div className={styles.passwordWrapper}>
            <input
              type={passwordVisible ? 'text' : 'password'}
              className={`${styles.input} ${passwordError ? styles.invalid : ''}`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
            />
            <span
              className={styles.togglePassword}
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? 'Hide' : 'Show'}
            </span>
          </div>
          {passwordError && <div className={styles.error}>{passwordError}</div>}

          <button type="submit" className={styles.loginButton}>
            Log in
          </button>

          <p className={styles.agreement}>
            By continuing, you agree to the{' '}
            <a href="#">Terms of use</a> and <a href="#">Privacy Policy.</a>
          </p>

          <div className={styles.links}>
            <a href="#">Other issue with sign in</a>
            <a href="#">Forget your password</a>
          </div>
        </form>

        <div className={styles.divider}>
          <hr />
          <span>New to our community</span>
          <hr />
        </div>

        <button
          className={styles.createButton}
          onClick={() => navigate('/register', { state: { from: location.pathname } })}
        >
          Create an account
        </button>
      </div>
    </div>
  );
}
