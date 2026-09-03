import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const location = useLocation();
  const isHome = location.pathname.startsWith('/home');
  const isProfile = location.pathname.startsWith('/profile');

  return (
    <nav className="sidebar-nav">
      <div className="sidebar-brand">OBSCURA FULGUR</div>
      <div className="sidebar-icons">
        <Link
          to="/home"
          className={isHome ? 'sidebar-icon active' : 'sidebar-icon'}
          aria-label="Home"
          aria-current={isHome ? 'page' : undefined}
        >
          <HomeIcon />
        </Link>
        {}
        <Link
          to="/profile/1"
          className={isProfile ? 'sidebar-icon active' : 'sidebar-icon'}
          aria-label="Profile"
          aria-current={isProfile ? 'page' : undefined}
        >
          <ProfileIcon />
        </Link>
      </div>
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
      <path d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3z" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

export default Header;
