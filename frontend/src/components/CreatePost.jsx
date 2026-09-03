import { useState } from 'react';
import './CreatePost.css';

function CreatePost({ onCancel }) {
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('New post submitted (stub):', { caption, imageFile });
  };

  return (
    <form className="create-post" onSubmit={handleSubmit}>
      <h3>New Post</h3>
      <label>
        Image
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          required
        />
      </label>
      <label>
        Caption
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption..."
          rows={3}
        />
      </label>
      <div className="create-post-actions">
        <button type="submit">Post</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

export default CreatePost;
