import { useState } from 'react';
import './EditProfileForm.css';

function EditProfileForm({ user, onCancel }) {
  const [name, setName] = useState(user.name);
  const [pronouns, setPronouns] = useState(user.pronouns);
  const [bio, setBio] = useState(user.bio);
  const [links, setLinks] = useState(user.links);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Profile update submitted (stub):', { name, pronouns, bio, links });
  };

  return (
    <form className="edit-profile-form" onSubmit={handleSubmit}>
      <h3>Edit Profile</h3>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label>
        Pronouns
        <input value={pronouns} onChange={(e) => setPronouns(e.target.value)} />
      </label>
      <label>
        Bio
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
      </label>
      <label>
        Links
        <input value={links} onChange={(e) => setLinks(e.target.value)} />
      </label>
      <div className="edit-profile-actions">
        <button type="submit">Save</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

export default EditProfileForm;
