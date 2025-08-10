import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './registerpage.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();

  // Form values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Visibility toggle
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Error messages
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const isValidName = (name: string) => {
    return name === name.trim() && name.trim().length > 0;
  };

  const isValidEmail = (email: string) => {
    return email === email.trim() && email.includes('@') && email.trim().length > 0;
  };

  const isValidPassword = (pwd: string) => {
    const lengthOK = pwd.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSymbol = /[^a-zA-Z0-9\s]/.test(pwd);
    const hasNoSpaces = !/\s/.test(pwd);
    return lengthOK && hasLetter && hasNumber && hasSymbol && hasNoSpaces;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;

    if (!isValidName(name)) {
      setNameError('Name cannot be empty or have leading/trailing spaces.');
      hasError = true;
    } else {
      setNameError('');
    }

    if (!isValidEmail(email)) {
      setEmailError('Email must be valid and contain no spaces.');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!isValidPassword(password)) {
      setPasswordError(
        'Password must be ≥8 chars with letters, numbers, symbols. No leading/trailing spaces.'
      );
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) return;

    try {
      const response = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password,
        }),
      });

      if (response.ok) {
        alert('Account created successfully!');
        navigate('/login');
      } else {
        const error = await response.json();
        alert(error.message || 'Registration failed.');
      }
    } catch (err) {
      alert('An error occurred. Please try again.');
      console.error('Registration error:', err);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <h2>Create an account</h2>
      <p className={styles.loginLink}>
        Already have an account? <a href="/login">Log in</a>
      </p>

      <form className={styles.registerForm} onSubmit={handleSubmit}>
        <label>What should we call you?</label>
        <input
          className={nameError ? styles.invalid : ''}
          type="text"
          placeholder="Enter your profile name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError('');
          }}
        />
        {nameError && <div className={styles.error}>{nameError}</div>}

        <label>What's your email?</label>
        <input
          className={emailError ? styles.invalid : ''}
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError('');
          }}
        />
        {emailError && <div className={styles.error}>{emailError}</div>}

        <label>Create a password</label>
        <div className={styles.passwordWrapper}>
          <input
            className={passwordError ? styles.invalid : ''}
            type={passwordVisible ? 'text' : 'password'}
            placeholder="Enter your password"
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

        <small className={styles.passwordHint}>
          Use 8+ characters with letters, numbers & symbols. No leading/trailing spaces.
        </small>

        <p className={styles.agreementText}>
          By creating an account, you agree to the
          <a href="#"> Terms of use </a>
          and
          <a href="#"> Privacy Policy</a>.
        </p>

        <button type="submit" className={styles.registerButton}>
          Create an account
        </button>
      </form>
    </div>
  );
}
