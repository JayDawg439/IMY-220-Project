import { useState } from 'react';
import './EditPostForm.css';

function EditPostForm({ post, onCancel }) {
  const [caption, setCaption] = useState(post.caption);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Post update submitted (stub):', { id: post.id, caption });
  };

  return (
    <form className="edit-post-form" onSubmit={handleSubmit}>
      <h4>Edit Post</h4>
      <label>
        Caption
        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={2} />
      </label>
      <label>
        Replace Image
        <input type="file" accept="image/*" />
      </label>
      <div className="edit-post-actions">
        <button type="submit">Save</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

export default EditPostForm;
