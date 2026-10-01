import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginForm() {
	const navigate = useNavigate();
	const { login } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [touched, setTouched] = useState({ email: false, password: false });
	const [submitError, setSubmitError] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const errors = {
		email: !email ? 'Email is required.' : !EMAIL_REGEX.test(email) ? 'Enter a valid email address.' : '',
		password: !password ? 'Password is required.' : password.length < 6 ? 'Password must be at least 6 characters.' : '',
	};
	const isValid = !errors.email && !errors.password;
	const handleBlur = (field) => setTouched((t) => ({ ...t, [field]: true }));

	const handleSubmit = async (e) => {
		e.preventDefault();
		setTouched({ email: true, password: true });
		if(!isValid){
			return;
		}

		setSubmitError('');
		setSubmitting(true);
		try {
			await login(email, password);
			navigate('/home');
		} catch (err) {
			setSubmitError(err.message);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} noValidate className="flex w-72 flex-col gap-3 border border-neon bg-void p-5 shadow-[0_0_20px_#39ff1433]">
			<label className="label">
				Email
				<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => handleBlur('email')} className="field" />
				{touched.email && errors.email && <span className="error-text">{errors.email}</span>}
			</label>
			<label className="label">
				Password
				<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => handleBlur('password')} className="field" />
				{touched.password && errors.password && <span className="error-text">{errors.password}</span>}
			</label>
			{submitError && <span className="error-text">{submitError}</span>}
			<button type="submit" disabled={!isValid || submitting} className="btn mt-1">
				{submitting ? 'LOGGING IN...' : 'LOGIN'}
			</button>
		</form>
	);
}

export default LoginForm;
