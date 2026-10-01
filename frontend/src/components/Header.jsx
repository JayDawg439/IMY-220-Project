import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const iconClass = (active) =>
	`flex rounded-full p-2 transition ${active ? 'bg-neon text-void' : 'text-ink hover:bg-panel-2 hover:text-neon'}`;

function Header() {
	const { user, logout } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();

	const isHome = location.pathname.startsWith('/home');
	const isProfile = location.pathname.startsWith('/profile') && location.pathname.endsWith(user?.id || '');
	const isAdmin = location.pathname.startsWith('/admin');

	const handleLogout = async () => {
		await logout();
		navigate('/');
	};

	return (
		<nav className="sticky top-0 flex h-screen w-16 min-w-16 flex-col items-center justify-between self-start border-r border-edge bg-panel py-6">
			<div className="[writing-mode:vertical-rl] rotate-180 text-sm font-bold tracking-[0.3em] text-neon [text-shadow:0_0_8px_var(--color-neon)]">
				OBSCURA FULGUR
			</div>

			<div className="flex flex-col items-center gap-5">
				<Link to="/home" className={iconClass(isHome)} aria-label="Home" title="Home">
					<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3z" /></svg>
				</Link>
				<Link to={`/profile/${user?.id}`} className={iconClass(isProfile)} aria-label="Profile" title="Profile">
					<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
						<circle cx="12" cy="8" r="4" />
						<path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
					</svg>
				</Link>
				{user?.role === 'admin' && (
					<Link to="/admin" className={iconClass(isAdmin)} aria-label="Admin" title="Admin">
						<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5z" /></svg>
					</Link>
				)}
				<button onClick={handleLogout} className={`${iconClass(false)} cursor-pointer`} aria-label="Log out" title="Log out">
					<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
						<path d="m16 17 5-5-5-5" />
						<path d="M21 12H9" />
					</svg>
				</button>
			</div>
		</nav>
	);
}

export default Header;
