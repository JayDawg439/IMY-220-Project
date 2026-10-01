import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ProfilePreview from '../components/ProfilePreview';
import { Loading, ErrorMessage, Empty } from '../components/Status';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

function Admin() {
	const { user: me } = useAuth();
	const [reports, setReports] = useState([]);
	const [reasons, setReasons] = useState([]);
	const [users, setUsers] = useState([]);
	const [newReason, setNewReason] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const load = useCallback(async () => {
		try {
			const [r, re, u] = await Promise.all([api('/reports'), api('/reports/reasons'), api('/users')]);
			setReports(r.reports);
			setReasons(re.reasons);
			setUsers(u.users);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => { load(); }, [load]);

	const act = async (fn) => {
		setError('');
		try {
			await fn();
			await load();
		} catch (err) {
			setError(err.message);
		}
	};

	const addReason = (e) => {
		e.preventDefault();
		if(!newReason.trim()){
			return;
		}
		act(async () => {
			await api('/reports/reasons', { method: 'POST', body: { label: newReason } });
			setNewReason('');
		});
	};

	const deletePost = (id) => {
		if(window.confirm('Delete this reported post?')){
			act(() => api(`/posts/${id}`, { method: 'DELETE' }));
		}
	};
	const deleteUser = (u) => {
		if(window.confirm(`Delete @${u.username} and everything they posted?`)){
			act(() => api(`/users/${u.id}`, { method: 'DELETE' }));
		}
	};

	if(loading){
		return <Layout><Loading /></Layout>;
	}

	return (
		<Layout>
			<h1 className="mb-1 text-2xl text-neon">Admin</h1>
			<p className="mb-5 text-sm text-mute">Admins can also edit or delete any post, album, comment or profile directly on its page.</p>
			<ErrorMessage message={error} />

			<div className="mt-4 grid gap-6 xl:grid-cols-2">
				<section className="flex flex-col gap-3">
					<h2 className="text-lg">Reported posts ({reports.length})</h2>
					{reports.length === 0 && <Empty>No reports. All quiet.</Empty>}
					{reports.map((r) => (
						<div key={r.id} className="panel flex gap-3">
							{r.post ? (
								<Link to={`/post/${r.post.id}`}>
									<img src={r.post.imageUrl} alt="" className="size-20 border border-edge object-cover" />
								</Link>
							) : (
								<div className="grid size-20 place-items-center border border-edge text-xs text-mute">deleted</div>
							)}
							<div className="min-w-0 flex-1 text-sm">
								<p className="font-bold text-danger">{r.reason}</p>
								{r.details && <p className="break-words text-mute">“{r.details}”</p>}
								<p className="text-xs text-mute">reported by @{r.reporter.username}</p>
								<div className="mt-2 flex gap-2">
									{r.post && <button onClick={() => deletePost(r.post.id)} className="btn btn-danger px-2 py-1">DELETE POST</button>}
									<button onClick={() => act(() => api(`/reports/${r.id}`, { method: 'DELETE' }))} className="btn btn-ghost px-2 py-1">DISMISS</button>
								</div>
							</div>
						</div>
					))}
				</section>

				<section className="flex flex-col gap-3">
					<h2 className="text-lg">Report reasons</h2>
					<form onSubmit={addReason} className="flex gap-2">
						<input value={newReason} onChange={(e) => setNewReason(e.target.value)} placeholder="Add a new reason..." maxLength={60} className="field flex-1" />
						<button type="submit" className="btn btn-solid">ADD</button>
					</form>
					<ul className="flex flex-wrap gap-2">
						{reasons.map((r) => (
							<li key={r.id} className="flex items-center gap-2 border border-edge bg-panel px-3 py-1 text-sm">
								{r.label}
								<button onClick={() => act(() => api(`/reports/reasons/${r.id}`, { method: 'DELETE' }))} aria-label={`Remove ${r.label}`} className="cursor-pointer text-mute transition hover:text-danger">✕</button>
							</li>
						))}
					</ul>

					<h2 className="mt-4 text-lg">All users ({users.length})</h2>
					<div className="flex flex-col gap-2">
						{users.map((u) => (
							<ProfilePreview key={u.id} user={u}>
								{u.role === 'admin' && <span className="font-mono text-xs text-neon">ADMIN</span>}
								{u.id !== me.id && <button onClick={() => deleteUser(u)} className="btn btn-danger px-2 py-1">DELETE</button>}
							</ProfilePreview>
						))}
					</div>
				</section>
			</div>
		</Layout>
	);
}

export default Admin;
