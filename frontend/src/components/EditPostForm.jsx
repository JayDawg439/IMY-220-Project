import { useState } from 'react';
import { api } from '../lib/api';
import { readImage } from '../lib/images';

function EditPostForm({ post, onSaved, onCancel }) {
  const [caption, setCaption] = useState(post.caption);
  const [hashtags, setHashtags] = useState(post.hashtags.map((t) => `#${t}`).join(' '));
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const body = { caption, hashtags };
      if (file) body.image = await readImage(file);
      const data = await api(`/posts/${post.id}`, { method: 'PUT', body });
      onSaved(data.post);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="panel flex flex-col gap-3">
      <h4 className="text-neon">Edit Post</h4>
      <label className="label">
        Caption
        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={2} maxLength={500} className="field" />
      </label>
      <label className="label">
        Hashtags
        <input value={hashtags} onChange={(e) => setHashtags(e.target.value)} placeholder="#sunset #film" className="field" />
      </label>
      <label className="label">
        Replace image (optional)
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0] || null)} className="field file:mr-3 file:cursor-pointer file:border-0 file:bg-neon file:px-3 file:py-1 file:text-xs file:font-bold file:text-void" />
      </label>
      {error && <p className="error-text">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={submitting} className="btn btn-solid">{submitting ? 'SAVING...' : 'SAVE'}</button>
        <button type="button" onClick={onCancel} className="btn btn-ghost">CANCEL</button>
      </div>
    </form>
  );
}

export default EditPostForm;
