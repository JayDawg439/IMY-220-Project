import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

function Comments({ postId, postAuthorId, onCountChange }) {
	const { user } = useAuth();
	const [list, setList] = useState([]);
	const [text, setText] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		api(`/posts/${postId}/comments`)
			.then((data) => setList(data.comments))
			.catch((err) => setError(err.message))
			.finally(() => setLoading(false));
	}, [postId]);

	const update = (next) => {
		setList(next);
		onCountChange?.(next.length);
	};

	const handleAdd = async (e) => {
		e.preventDefault();
		if(!text.trim()){
			return;
		}
		setError('');
		try {
			const data = await api(`/posts/${postId}/comments`, { method: 'POST', body: { text } });
			update([...list, data.comment]);
			setText('');
		} catch (err) {
			setError(err.message);
		}
	};

	const handleDelete = async (id) => {
		setError('');
		try {
			await api(`/posts/${postId}/comments/${id}`, { method: 'DELETE' });
			update(list.filter((c) => c.id !== id));
		} catch (err) {
			setError(err.message);
		}
	};

	const canDelete = (c) => user.role === 'admin' || c.author.id === user.id || postAuthorId === user.id;

	return (
		<div className="panel flex flex-col gap-3">
			<h4 className="text-sm uppercase tracking-widest text-neon">Comments ({list.length})</h4>
			<ul className="flex max-h-64 flex-col gap-2 overflow-y-auto text-sm">
				{loading && <li className="text-mute">loading...</li>}
				{!loading && list.length === 0 && <li className="italic text-mute">No comments yet.</li>}
				{list.map((c) => (
					<li key={c.id} className="flex items-start justify-between gap-2">
						<span>
							<Link to={`/profile/${c.author.id}`} className="mr-1 font-bold text-neon hover:underline">{c.author.username}</Link>
							{c.text}
						</span>
						{canDelete(c) && (
							<button onClick={() => handleDelete(c.id)} aria-label="Delete comment" className="cursor-pointer text-xs text-mute transition hover:text-danger">✕</button>
						)}
					</li>
				))}
			</ul>
			{error && <p className="error-text">{error}</p>}
			<form onSubmit={handleAdd} className="flex gap-2">
				<input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment..." maxLength={300} className="field flex-1" />
				<button type="submit" className="btn btn-solid">POST</button>
			</form>
		</div>
	);
}

export default Comments;
