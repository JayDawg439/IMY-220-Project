import { useState } from 'react';
import './Comments.css';

function Comments({ comments }) {
  const [list, setList] = useState(comments);
  const [text, setText] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setList([...list, { id: `local-${Date.now()}`, user: 'you', text }]);
    setText('');
  };

  return (
    <div className="comments">
      <h4>Comments</h4>
      <ul className="comments-list">
        {list.map(c => (
          <li key={c.id}>
            <span className="comment-user">{c.user}</span> {c.text}
          </li>
        ))}
        {list.length === 0 && <li className="comments-empty">No comments yet.</li>}
      </ul>
      <form className="comments-add" onSubmit={handleAdd}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
        />
        <button type="submit">Post</button>
      </form>
    </div>
  );
}

export default Comments;
