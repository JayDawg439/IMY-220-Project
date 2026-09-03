import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthForms.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SignupForm() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({
    username: false, email: false, password: false, confirmPassword: false,
  });
  const [submitError, setSubmitError] = useState('');

  const errors = {
    username: !username
      ? 'Username is required.'
      : username.length < 3
      ? 'Username must be at least 3 characters.'
      : '',
    email: !email
      ? 'Email is required.'
      : !EMAIL_REGEX.test(email)
      ? 'Enter a valid email address.'
      : '',
    password: !password
      ? 'Password is required.'
      : password.length < 6
      ? 'Password must be at least 6 characters.'
      : '',
    confirmPassword: !confirmPassword
      ? 'Please confirm your password.'
      : confirmPassword !== password
      ? 'Passwords do not match.'
      : '',
  };

  const isValid = Object.values(errors).every(msg => msg === '');

  const handleBlur = (field) => setTouched(t => ({ ...t, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ username: true, email: true, password: true, confirmPassword: true });
    if (!isValid) return;

    setSubmitError('');
    try {
      const res = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      console.log('Signup response:', data);
      navigate('/home');
    } catch (err) {
      console.error('Signup failed:', err);
      setSubmitError('Something went wrong. Please try again.');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <label>
        Username
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={() => handleBlur('username')}
        />
        {touched.username && errors.username && (
          <span className="auth-error">{errors.username}</span>
        )}
      </label>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur('email')}
        />
        {touched.email && errors.email && (
          <span className="auth-error">{errors.email}</span>
        )}
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => handleBlur('password')}
        />
        {touched.password && errors.password && (
          <span className="auth-error">{errors.password}</span>
        )}
      </label>
      <label>
        Confirm Password
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => handleBlur('confirmPassword')}
        />
        {touched.confirmPassword && errors.confirmPassword && (
          <span className="auth-error">{errors.confirmPassword}</span>
        )}
      </label>
      {submitError && <span className="auth-error">{submitError}</span>}
      <button type="submit" disabled={!isValid}>SIGN UP</button>
    </form>
  );
}

export default SignupForm;
