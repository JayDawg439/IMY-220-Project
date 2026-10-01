import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearToken, getToken, setToken } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(Boolean(getToken()));

	useEffect(() => {
		if(!getToken()){
			return;
		}
		api('/auth/me')
			.then((data) => setUser(data.user))
			.catch(() => clearToken())
			.finally(() => setLoading(false));
	}, []);

	const login = useCallback(async (email, password) => {
		const data = await api('/auth/login', { method: 'POST', body: { email, password } });
		setToken(data.token);
		setUser(data.user);
	}, []);

	const signup = useCallback(async (username, email, password) => {
		const data = await api('/auth/signup', { method: 'POST', body: { username, email, password } });
		setToken(data.token);
		setUser(data.user);
	}, []);

	const logout = useCallback(async () => {
		try {
			await api('/auth/logout', { method: 'POST' });
		} finally {
			clearToken();
			setUser(null);
		}
	}, []);

	const value = useMemo(() => ({ user, setUser, loading, login, signup, logout }), [user, loading, login, signup, logout]);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
