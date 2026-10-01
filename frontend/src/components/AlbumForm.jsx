import { useState } from 'react';
import { api } from '../lib/api';

function AlbumForm({ album, onSaved, onCancel }) {
	const editing = Boolean(album);
	const [name, setName] = useState(album?.name || '');
	const [description, setDescription] = useState(album?.description || '');
	const [hashtags, setHashtags] = useState((album?.hashtags || []).map((t) => `#${t}`).join(' '));
	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSubmitting(true);
		try {
			const data = await api(editing ? `/albums/${album.id}` : '/albums', {
				method: editing ? 'PUT' : 'POST',
				body: { name, description, hashtags },
			});
			onSaved(data.album);
		} catch (err) {
			setError(err.message);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="panel flex max-w-md flex-col gap-3">
			<h3 className="text-lg text-neon">{editing ? 'Edit Album' : 'New Album'}</h3>
			<label className="label">Name<input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} className="field" /></label>
			<label className="label">Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={500} className="field" /></label>
			<label className="label">Hashtags<input value={hashtags} onChange={(e) => setHashtags(e.target.value)} placeholder="#travel #film" className="field" /></label>
			{error && <p className="error-text">{error}</p>}
			<div className="flex gap-2">
				<button type="submit" disabled={submitting} className="btn btn-solid">{submitting ? 'SAVING...' : editing ? 'SAVE' : 'CREATE'}</button>
				<button type="button" onClick={onCancel} className="btn btn-ghost">CANCEL</button>
			</div>
		</form>
	);
}

export default AlbumForm;
