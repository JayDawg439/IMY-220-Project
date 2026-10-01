import { useState } from 'react';
import { api } from '../lib/api';
import { readImage } from '../lib/images';

function CreatePost({ onCreated, onCancel }) {
	const [file, setFile] = useState(null);
	const [caption, setCaption] = useState('');
	const [hashtags, setHashtags] = useState('');
	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if(!file){
			setError('Please choose an image.');
			return;
		}
		setError('');
		setSubmitting(true);
		try {
			const image = await readImage(file);
			const data = await api('/posts', { method: 'POST', body: { image, caption, hashtags } });
			onCreated(data.post);
		} catch (err) {
			setError(err.message);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="panel flex max-w-md flex-col gap-3">
			<h3 className="text-lg text-neon">New Post</h3>
			<label className="label">
				Image
				<input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0] || null)} className="field file:mr-3 file:cursor-pointer file:border-0 file:bg-neon file:px-3 file:py-1 file:text-xs file:font-bold file:text-void" />
			</label>
			<label className="label">
				Caption
				<textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Write a caption..." rows={3} maxLength={500} className="field" />
			</label>
			<label className="label">
				Hashtags
				<input value={hashtags} onChange={(e) => setHashtags(e.target.value)} placeholder="#sunset #film" className="field" />
			</label>
			{error && <p className="error-text">{error}</p>}
			<div className="flex gap-2">
				<button type="submit" disabled={submitting} className="btn btn-solid">{submitting ? 'POSTING...' : 'POST'}</button>
				<button type="button" onClick={onCancel} className="btn btn-ghost">CANCEL</button>
			</div>
		</form>
	);
}

export default CreatePost;
