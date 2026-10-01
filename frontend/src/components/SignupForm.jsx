import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

function SignupForm() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  const errors = {
    username: !form.username ? 'Username is required.' : !USERNAME_REGEX.test(form.username) ? '3-20 characters: letters, numbers, underscores.' : '',
    email: !form.email ? 'Email is required.' : !EMAIL_REGEX.test(form.email) ? 'Enter a valid email address.' : '',
    password: !form.password ? 'Password is required.' : form.password.length < 6 ? 'Password must be at least 6 characters.' : '',
    confirmPassword: !form.confirmPassword ? 'Please confirm your password.' : form.confirmPassword !== form.password ? 'Passwords do not match.' : '',
  };
  const isValid = Object.values(errors).every((m) => m === '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ username: true, email: true, password: true, confirmPassword: true });
    if (!isValid) return;

    setSubmitError('');
    setSubmitting(true);
    try {
      await signup(form.username, form.email, form.password);
      navigate('/home');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    ['username', 'Username', 'text'],
    ['email', 'Email', 'email'],
    ['password', 'Password', 'password'],
    ['confirmPassword', 'Confirm Password', 'password'],
  ];

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-72 flex-col gap-3 border border-neon bg-void p-5 shadow-[0_0_20px_#39ff1433]">
      {fields.map(([name, label, type]) => (
        <label key={name} className="label">
          {label}
          <input type={type} value={form[name]} onChange={set(name)} onBlur={blur(name)} className="field" />
          {touched[name] && errors[name] && <span className="error-text">{errors[name]}</span>}
        </label>
      ))}
      {submitError && <span className="error-text">{submitError}</span>}
      <button type="submit" disabled={!isValid || submitting} className="btn mt-1">
        {submitting ? 'CREATING...' : 'SIGN UP'}
      </button>
    </form>
  );
}

export default SignupForm;
