import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
import { useAuth } from '../context/AuthContext';

function Aperture() {
  return (
    <svg viewBox="0 0 200 200" className="size-44 text-neon drop-shadow-[0_0_10px_#39ff14]" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="100" cy="100" r="88" />
      <circle cx="100" cy="100" r="30" />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <path key={deg} transform={`rotate(${deg} 100 100)`} d="M100 12 L100 70 L150 41" />
      ))}
    </svg>
  );
}

function Splash() {
  const { user, loading } = useAuth();
  const [activeForm, setActiveForm] = useState(null);

  if (!loading && user) return <Navigate to="/home" replace />;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-10 md:flex-row md:gap-24">
      <div className="text-2xl font-bold tracking-[0.3em] text-neon [text-shadow:0_0_8px_var(--color-neon)] md:absolute md:left-8 md:top-1/2 md:-translate-y-1/2 md:[writing-mode:vertical-rl] md:rotate-180">
        OBSCURA FULGUR
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="grid h-72 w-64 place-items-center border-2 border-neon bg-panel shadow-[0_0_20px_#39ff1466]">
          <Aperture />
        </div>
        <p className="font-mono text-lg text-neon">upload your life</p>
      </div>

      <div className="flex min-w-52 flex-col items-center gap-4">
        {activeForm === null && (
          <>
            <button className="btn w-44 py-3 text-sm" onClick={() => setActiveForm('login')}>LOGIN</button>
            <button className="btn w-44 py-3 text-sm" onClick={() => setActiveForm('signup')}>SIGNUP</button>
          </>
        )}
        {activeForm === 'login' && <LoginForm />}
        {activeForm === 'signup' && <SignupForm />}
        {activeForm !== null && (
          <button className="cursor-pointer text-xs text-neon hover:underline" onClick={() => setActiveForm(null)}>
            &larr; back
          </button>
        )}
      </div>
    </div>
  );
}

export default Splash;
