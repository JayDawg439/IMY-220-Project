import { useState } from 'react';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
import './Splash.css';

function Splash() {
  const [activeForm, setActiveForm] = useState(null);

  return (
    <div className="splash-page">
      <div className="splash-brand">OBSCURA FULGUR</div>

      <div className="splash-center">
        <div className="splash-illustration">
          <span>illustration</span>
        </div>
        <p className="splash-tagline">upload your life</p>
      </div>

      <div className="splash-actions">
        {activeForm === null && (
          <>
            <button className="splash-btn" onClick={() => setActiveForm('login')}>
              LOGIN
            </button>
            <button className="splash-btn" onClick={() => setActiveForm('signup')}>
              SIGNUP
            </button>
          </>
        )}
        {activeForm === 'login' && (
          <>
            <LoginForm />
            <button className="splash-back" onClick={() => setActiveForm(null)}>
              &larr; back
            </button>
          </>
        )}
        {activeForm === 'signup' && (
          <>
            <SignupForm />
            <button className="splash-back" onClick={() => setActiveForm(null)}>
              &larr; back
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Splash;
