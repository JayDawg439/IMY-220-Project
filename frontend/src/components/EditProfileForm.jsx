import { useState } from 'react';
import { api } from '../lib/api';
import { readImage } from '../lib/images';

function EditProfileForm({ user, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: user.name,
    username: user.username,
    pronouns: user.pronouns || '',
    bio: user.bio || '',
    links: user.links || '',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const body = { ...form };
      if (file) body.avatar = await readImage(file, 400, 0.85);
      const data = await api(`/users/${user.id}`, { method: 'PUT', body });
      onSaved(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="panel flex max-w-md flex-col gap-3">
      <h3 className="text-lg text-neon">Edit Profile</h3>
      <label className="label">Name<input value={form.name} onChange={set('name')} required maxLength={60} className="field" /></label>
      <label className="label">Username<input value={form.username} onChange={set('username')} required className="field" /></label>
      <label className="label">Pronouns<input value={form.pronouns} onChange={set('pronouns')} maxLength={30} className="field" /></label>
      <label className="label">Bio<textarea value={form.bio} onChange={set('bio')} rows={3} maxLength={300} className="field" /></label>
      <label className="label">Links<input value={form.links} onChange={set('links')} maxLength={200} className="field" /></label>
      <label className="label">
        Profile picture (optional)
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

export default EditProfileForm;
