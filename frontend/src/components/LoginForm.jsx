import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthForms.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitError, setSubmitError] = useState('');

  const errors = {
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
  };

  const isValid = !errors.email && !errors.password;

  const handleBlur = (field) => setTouched(t => ({ ...t, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!isValid) return;

    setSubmitError('');
    try {
      const res = await fetch('http://localhost:5000/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      console.log('Login response:', data);
      navigate('/home');
    } catch (err) {
      console.error('Login failed:', err);
      setSubmitError('Something went wrong. Please try again.');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
      {submitError && <span className="auth-error">{submitError}</span>}
      <button type="submit" disabled={!isValid}>LOGIN</button>
    </form>
  );
}

export default LoginForm;
